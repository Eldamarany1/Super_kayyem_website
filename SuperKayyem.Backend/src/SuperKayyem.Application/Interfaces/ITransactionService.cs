using SuperKayyem.Application.DTOs.Transactions;
using SuperKayyem.Domain.Common;

namespace SuperKayyem.Application.Interfaces;

public interface ITransactionService
{
    Task<ApiResponse<TransactionResponse>> CreateAsync(string userId, CreateTransactionRequest request);
    Task<ApiResponse<List<TransactionResponse>>> GetPendingAsync();
    Task<ApiResponse<List<TransactionResponse>>> GetAllAsync();
    Task<ApiResponse<TransactionResponse>> GetByIdAsync(string id);
    Task<ApiResponse<TransactionResponse>> ApproveAsync(string transactionId, string adminId, ReviewTransactionRequest request);
    Task<ApiResponse<TransactionResponse>> RejectAsync(string transactionId, string adminId, ReviewTransactionRequest request);
}
