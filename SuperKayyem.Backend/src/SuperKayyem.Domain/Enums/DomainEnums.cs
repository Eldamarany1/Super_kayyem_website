namespace SuperKayyem.Domain.Enums;

public enum BookType
{
    ParentingGuide,
    ChildrenStory
}

public enum PublicationStatus
{
    Draft,
    Published,
    Cancelled
}

public enum DiscountType
{
    Percentage,
    Fixed
}

public enum TransactionStatus
{
    PendingVerification,
    Approved,
    Rejected
}

public enum PurchaseItemType
{
    Story,
    Package
}

public enum UserRole
{
    Admin,
    User
}
