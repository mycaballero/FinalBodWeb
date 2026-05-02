"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateNextStock = calculateNextStock;
exports.canApplyMovement = canApplyMovement;
const movement_entity_1 = require("./entities/movement.entity");
function calculateNextStock(currentStock, type, quantity) {
    return type === movement_entity_1.MovementType.IN
        ? currentStock + quantity
        : currentStock - quantity;
}
function canApplyMovement(currentStock, type, quantity) {
    if (quantity <= 0) {
        return false;
    }
    if (type === movement_entity_1.MovementType.OUT) {
        return quantity <= currentStock;
    }
    return true;
}
//# sourceMappingURL=stock.utils.js.map