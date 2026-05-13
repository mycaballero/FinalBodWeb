import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';

describe('HttpExceptionFilter', () => {
  const buildHost = (request: { url: string }) => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    return {
      host: {
        switchToHttp: () => ({
          getResponse: () => ({ status }),
          getRequest: () => request,
        }),
      } as unknown as ArgumentsHost,
      status,
      json,
    };
  };

  it('shouldSerializeHttpExceptionWithObjectPayload', () => {
    const filter = new HttpExceptionFilter();
    const { host, status, json } = buildHost({ url: '/api/x' });
    const exception = new HttpException(
      { message: 'fallo', details: { field: 'x' } },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: HttpStatus.BAD_REQUEST,
        message: 'fallo',
        details: { message: 'fallo', details: { field: 'x' } },
        path: '/api/x',
        timestamp: expect.any(String),
      }),
    );
  });

  it('shouldSerializeHttpExceptionWithStringPayload', () => {
    const filter = new HttpExceptionFilter();
    const { host, status, json } = buildHost({ url: '/api/y' });
    const exception = new HttpException('texto-plano', HttpStatus.NOT_FOUND);

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: HttpStatus.NOT_FOUND,
        message: 'texto-plano',
        details: null,
        path: '/api/y',
        timestamp: expect.any(String),
      }),
    );
  });

  it('shouldSerializeUnknownExceptionAsInternalError', () => {
    const filter = new HttpExceptionFilter();
    const { host, status, json } = buildHost({ url: '/api/z' });

    filter.catch(new Error('boom'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith({
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      details: null,
      path: '/api/z',
      timestamp: expect.any(String),
    });
  });
});
