using MongoDB.Bson.Serialization.Attributes;
using SuperKayyem.Domain.Common;
using SuperKayyem.Domain.Enums;

namespace SuperKayyem.Domain.Entities;

/// <summary>
/// Manual Payment Transaction entity.
/// Workflow: User submits receipt → PendingVerification → Admin Approves/Rejects.
/// </summary>
[BsonIgnoreExtraElements]
public sealed class Transaction : BaseEntity
{
    public string UserId { get; private set; }
    
    /// <summary>Either a StoryId or PackageId depending on PurchaseItemType.</summary>
    public string ItemId { get; private set; }
    public PurchaseItemType ItemType { get; private set; }
    public decimal Amount { get; private set; }

    /// <summary>URL/path to lower uploaded receipt image.</summary>
    public string ReceiptImageUrl { get; private set; }

    public TransactionStatus Status { get; private set; }

    /// <summary>Admin review notes (rejection reason etc.).</summary>
    public string? AdminNote { get; private set; }

    public DateTime? ReviewedAt { get; private set; }
    public string? ReviewedByAdminId { get; private set; }

    private Transaction()
    {
        UserId = string.Empty;
        ItemId = string.Empty;
        ReceiptImageUrl = string.Empty;
    }

    public static Transaction Create(string userId, string itemId, PurchaseItemType itemType, decimal amount, string receiptImageUrl)
    {
        if (string.IsNullOrWhiteSpace(userId)) throw new ArgumentException("UserId is required.");
        if (string.IsNullOrWhiteSpace(itemId)) throw new ArgumentException("ItemId is required.");
        if (amount < 0) throw new ArgumentException("Amount cannot be negative.");
        if (string.IsNullOrWhiteSpace(receiptImageUrl)) throw new ArgumentException("Receipt proof is required.");

        return new Transaction
        {
            UserId = userId,
            ItemId = itemId,
            ItemType = itemType,
            Amount = amount,
            ReceiptImageUrl = receiptImageUrl,
            Status = TransactionStatus.PendingVerification
        };
    }

    public void Approve(string adminId, string? note)
    {
        if (Status != TransactionStatus.PendingVerification)
            throw new InvalidOperationException($"Cannot approve transaction in '{Status}' state. Must be Pending.");

        if (string.IsNullOrWhiteSpace(adminId)) throw new ArgumentException("AdminId is required for approval.");

        Status = TransactionStatus.Approved;
        ReviewedByAdminId = adminId;
        AdminNote = note;
        ReviewedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Reject(string adminId, string? note)
    {
        if (Status != TransactionStatus.PendingVerification)
            throw new InvalidOperationException($"Cannot reject transaction in '{Status}' state. Must be Pending.");

        if (string.IsNullOrWhiteSpace(adminId)) throw new ArgumentException("AdminId is required for rejection.");

        Status = TransactionStatus.Rejected;
        ReviewedByAdminId = adminId;
        AdminNote = note;
        ReviewedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }
}
