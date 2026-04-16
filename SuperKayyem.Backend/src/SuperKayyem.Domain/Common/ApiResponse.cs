namespace SuperKayyem.Domain.Common;

/// <summary>
/// Generic envelope for all API responses.
/// Ensures consistent response shape across all endpoints.
/// </summary>
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public T? Data { get; set; }
    public IEnumerable<string>? Errors { get; set; }

    public static ApiResponse<T> Ok(T data, string message = "Operation successful.")
        => new() { Success = true, Message = message, Data = data };

    public static ApiResponse<T> Fail(string message, IEnumerable<string>? errors = null)
        => new() { Success = false, Message = message, Errors = errors };
}

/// <summary>Non-generic version for void operations.</summary>
public class ApiResponse : ApiResponse<object>
{
    public static ApiResponse Ok(string message = "Operation successful.")
        => new() { Success = true, Message = message };

    public static new ApiResponse Fail(string message, IEnumerable<string>? errors = null)
        => new() { Success = false, Message = message, Errors = errors };
}
