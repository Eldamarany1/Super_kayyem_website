namespace SuperKayyem.Application.DTOs.Payment;

/// <summary>
/// Static payment configuration values per business requirements.
/// Served to frontend so they can display payment instructions.
/// </summary>
public record PaymentConfigDto(
    string InstaPayNumber,
    string VodafoneCashNumber,
    string AccountName,
    string CustomerSupportEmail
)
{
    public static readonly PaymentConfigDto Default = new(
        InstaPayNumber: "01092257192",
        VodafoneCashNumber: "01092257192",
        AccountName: "Mahmoud Khalaf",
        CustomerSupportEmail: "Khalfmahmoud656@gmail.com"
    );
}
