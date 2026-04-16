using MongoDB.Bson.Serialization.Attributes;
using SuperKayyem.Domain.Common;
using SuperKayyem.Domain.Enums;

namespace SuperKayyem.Domain.Entities;

/// <summary>
/// Discount/promo code redeemable at checkout.
/// </summary>
[BsonIgnoreExtraElements]
public sealed class DiscountCode : BaseEntity
{
    public string CodeString { get; private set; }
    public DiscountType DiscountType { get; private set; }
    public decimal Value { get; private set; }
    public bool IsActive { get; private set; }

    private DiscountCode() 
    {
        CodeString = string.Empty;
    }

    public static DiscountCode Create(string codeString, DiscountType discountType, decimal value)
    {
        if (string.IsNullOrWhiteSpace(codeString)) throw new ArgumentException("CodeString is required.");
        if (value < 0) throw new ArgumentException("Discount value cannot be negative.");

        return new DiscountCode
        {
            CodeString = codeString.ToUpperInvariant().Trim(),
            DiscountType = discountType,
            Value = value,
            IsActive = true // Active by default
        };
    }

    public void Activate()
    {
        IsActive = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }
}
