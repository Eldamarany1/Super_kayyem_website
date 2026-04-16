using MongoDB.Driver;
using SuperKayyem.Application.DTOs.Transactions;
using SuperKayyem.Application.Interfaces;
using SuperKayyem.Domain.Common;
using SuperKayyem.Domain.Entities;
using SuperKayyem.Domain.Enums;
using SuperKayyem.Infrastructure.Persistence;

namespace SuperKayyem.Infrastructure.Services;

public class TransactionService : ITransactionService
{
    private readonly MongoDbContext _db;

    public TransactionService(MongoDbContext db) => _db = db;

    public async Task<ApiResponse<TransactionResponse>> CreateAsync(string userId, CreateTransactionRequest request)
    {
        var transaction = Transaction.Create(
            userId,
            request.ItemId,
            request.ItemType,
            request.Amount,
            request.ReceiptImageUrl
        );

        await _db.Transactions.InsertOneAsync(transaction);
        var user = await _db.Users.Find(u => u.Id == userId).FirstOrDefaultAsync();
        return ApiResponse<TransactionResponse>.Ok(
            Map(transaction, user?.FullName ?? "Unknown"),
            "Transaction submitted. It will be reviewed within 24 hours."
        );
    }

    public async Task<ApiResponse<List<TransactionResponse>>> GetPendingAsync()
    {
        var txns = await _db.Transactions
            .Find(t => t.Status == TransactionStatus.PendingVerification)
            .SortBy(t => t.CreatedAt)
            .ToListAsync();

        return ApiResponse<List<TransactionResponse>>.Ok(await EnrichAsync(txns));
    }

    public async Task<ApiResponse<List<TransactionResponse>>> GetAllAsync()
    {
        var txns = await _db.Transactions.Find(_ => true).SortByDescending(t => t.CreatedAt).ToListAsync();
        return ApiResponse<List<TransactionResponse>>.Ok(await EnrichAsync(txns));
    }

    public async Task<ApiResponse<TransactionResponse>> GetByIdAsync(string id)
    {
        var txn = await _db.Transactions.Find(t => t.Id == id).FirstOrDefaultAsync();
        if (txn is null) return ApiResponse<TransactionResponse>.Fail("Transaction not found.");
        var user = await _db.Users.Find(u => u.Id == txn.UserId).FirstOrDefaultAsync();
        return ApiResponse<TransactionResponse>.Ok(Map(txn, user?.FullName ?? "Unknown"));
    }

    public async Task<ApiResponse<TransactionResponse>> ApproveAsync(string transactionId, string adminId, ReviewTransactionRequest request)
    {
        var txn = await _db.Transactions.Find(t => t.Id == transactionId).FirstOrDefaultAsync();
        if (txn is null) return ApiResponse<TransactionResponse>.Fail("Transaction not found.");
        if (txn.Status != TransactionStatus.PendingVerification)
            return ApiResponse<TransactionResponse>.Fail("Transaction has already been reviewed.");

        // Update transaction state natively
        txn.Approve(adminId, request.AdminNote);
        await _db.Transactions.ReplaceOneAsync(t => t.Id == transactionId, txn);

        // Grant access to user
        var user = await _db.Users.Find(u => u.Id == txn.UserId).FirstOrDefaultAsync();
        if (user is not null)
        {
            if (txn.ItemType == PurchaseItemType.Story)
            {
                user.GrantStoryAccess(txn.ItemId);
            }
            else
            {
                user.GrantPackageAccess(txn.ItemId);

                // Also grant access to individual stories within the package
                var package = await _db.Packages.Find(p => p.Id == txn.ItemId).FirstOrDefaultAsync();
                if (package is not null)
                {
                    foreach (var storyId in package.StoryIds)
                    {
                        user.GrantStoryAccess(storyId);
                    }
                }
            }

            await _db.Users.ReplaceOneAsync(u => u.Id == txn.UserId, user);
        }

        return await GetByIdAsync(transactionId);
    }

    public async Task<ApiResponse<TransactionResponse>> RejectAsync(string transactionId, string adminId, ReviewTransactionRequest request)
    {
        var txn = await _db.Transactions.Find(t => t.Id == transactionId).FirstOrDefaultAsync();
        if (txn is null) return ApiResponse<TransactionResponse>.Fail("Transaction not found.");
        if (txn.Status != TransactionStatus.PendingVerification)
            return ApiResponse<TransactionResponse>.Fail("Transaction has already been reviewed.");

        txn.Reject(adminId, request.AdminNote);
        await _db.Transactions.ReplaceOneAsync(t => t.Id == transactionId, txn);
        return await GetByIdAsync(transactionId);
    }

    private async Task<List<TransactionResponse>> EnrichAsync(List<Transaction> txns)
    {
        var userIds = txns.Select(t => t.UserId).Distinct().ToList();
        var users = await _db.Users.Find(u => userIds.Contains(u.Id)).ToListAsync();
        var userMap = users.ToDictionary(u => u.Id, u => u.FullName);
        return txns.Select(t => Map(t, userMap.GetValueOrDefault(t.UserId, "Unknown"))).ToList();
    }

    private static TransactionResponse Map(Transaction t, string userName) =>
        new(t.Id, t.UserId, userName, t.ItemId, t.ItemType, t.Amount,
            t.ReceiptImageUrl, t.Status, t.AdminNote, t.CreatedAt, t.ReviewedAt);
}
