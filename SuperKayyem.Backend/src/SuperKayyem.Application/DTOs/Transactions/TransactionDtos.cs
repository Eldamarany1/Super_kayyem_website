using SuperKayyem.Domain.Enums;

namespace SuperKayyem.Application.DTOs.Transactions;

public record CreateTransactionRequest(
    string ItemId,
    PurchaseItemType ItemType,
    decimal Amount,
    string ReceiptImageUrl
);

public record ReviewTransactionRequest(
    string? AdminNote
);

public record TransactionResponse(
    string Id,
    string UserId,
    string UserFullName,
    string ItemId,
    PurchaseItemType ItemType,
    decimal Amount,
    string ReceiptImageUrl,
    TransactionStatus Status,
    string? AdminNote,
    DateTime CreatedAt,
    DateTime? ReviewedAt
);
