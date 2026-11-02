// ============================================================
// ErrorViewModel.cs — Error page view model
// Used by Views/Shared/Error.cshtml to display error information.
// ============================================================

namespace SuperKayyem.Models;

public class ErrorViewModel
{
    // Request ID that caused the error — useful for tracking issues in application logs
    // string?: means the value can be null (optional)
    public string? RequestId { get; set; }

    // Computed property: returns true if RequestId is not null or empty
    // => expression-bodied member — short syntax for { get { return ...; } }
    // Used in the View to display RequestId only when it has a value
    public bool ShowRequestId => !string.IsNullOrEmpty(RequestId);
}
