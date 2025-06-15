classDiagram
    %% ===== ENTIDADES PRINCIPALES =====
    
    class Identity {
        +int id
        +string firstName
        +string middleName
        +string firstLastName
        +string secondLastName
        +string email
        -string password
        +boolean status
        +string role
        +string profilePhotoUrl
        +string profilePhotoPublicId
        +Date createdAt
        +Date updatedAt
        +getFullName()
        +getDisplayName()
    }

    class Client {
        +int id
        +int identityId
        +string fullName
        +string cedula
        +Date birthDate
        +string phone
        +createProfile()
        +updateProfile()
        +getProfile()
    }

    class Technician {
        +int id
        +int identityId
        +string cedula
        +Date birthDate
        +int experienceYears
        +string idPhotoUrl
        +string idPhotoPublicId
        +createProfile()
        +updateProfile()
        +addSpecialty()
        +removeSpecialty()
        +getSpecialties()
    }

    %% ===== SOLICITUDES DE SERVICIO =====
    
    class ServiceRequest {
        +int id
        +int clientId
        +int applianceId
        +string description
        +string serviceType
        +DateTime proposedDateTime
        +string status
        +int technicianId
        +int addressId
        +DateTime acceptedAt
        +DateTime scheduledAt
        +DateTime completedAt
        +DateTime cancelledAt
        +DateTime expiresAt
        +string cancellationReason
        +DateTime createdAt
        +createRequest()
        +acceptRequest()
        +cancelRequest()
        +completeService()
        +proposeAlternativeDate()
    }

    class ServiceRequestOffer {
        +int id
        +int serviceRequestId
        +int technicianId
        +int clientId
        +decimal price
        +string status
        +string comment
        +DateTime createdAt
        +DateTime resolvedAt
        +makeOffer()
        +acceptOffer()
        +rejectOffer()
    }

    class AlternativeDateProposal {
        +int id
        +int serviceRequestId
        +int technicianId
        +DateTime proposedDateTime
        +string status
        +string comment
        +DateTime createdAt
        +proposeDate()
        +acceptProposal()
        +rejectProposal()
    }

    %% ===== ELECTRODOMÉSTICOS =====
    
    class Appliance {
        +int id
        +string type
        +string brand
        +string model
        +string name
        +boolean isActive
        +findByType()
        +findByBrand()
        +findByModel()
        +searchByName()
    }

    class ApplianceType {
        +int id
        +string name
        +string description
        +boolean isActive
        +findAll()
        +findById()
    }

    class ApplianceBrand {
        +int id
        +string name
        +boolean isActive
        +int typeId
        +findByType()
        +findAll()
    }

    class ApplianceModel {
        +int id
        +string name
        +string description
        +boolean isActive
        +int brandId
        +findByBrand()
        +findAll()
    }

    %% ===== DIRECCIONES =====
    
    class Address {
        +int id
        +string street
        +string number
        +string apartment
        +string neighborhood
        +string city
        +string state
        +string postalCode
        +string country
        +string additionalInfo
        +boolean isDefault
        +int userId
        +DateTime createdAt
        +DateTime updatedAt
        +createAddress()
        +updateAddress()
        +setAsDefault()
        +getFullAddress()
    }

    %% ===== CALIFICACIONES =====
    
    class Rating {
        +int id
        +int raterId
        +int ratedId
        +int score
        +string comment
        +int serviceRequestId
        +DateTime createdAt
        +rateService()
        +updateRating()
        +getAverageRating()
    }

    %% ===== NOTIFICACIONES =====
    
    class Notification {
        +int id
        +int userId
        +string message
        +boolean read
        +sendNotification()
        +markAsRead()
        +getUnreadNotifications()
    }

    %% ===== TICKETS DE AYUDA =====
    
    class HelpTicket {
        +int id
        +string type
        +string subject
        +string description
        +string reason
        +string status
        +int userId
        +int serviceRequestId
        +int assignedAdminId
        +int resolvedByAdminId
        +DateTime createdAt
        +DateTime updatedAt
        +DateTime resolvedAt
        +createTicket()
        +assignToAdmin()
        +resolveTicket()
        +updateStatus()
    }

    %% ===== RELACIONES PRINCIPALES =====
    
    %% Relación uno a uno - Identity con perfiles
    Identity "1" --> "0..1" Client : has profile
    Identity "1" --> "0..1" Technician : has profile
    
    %% Relaciones de Cliente
    Client "1" --> "*" ServiceRequest : solicita
    Client "1" --> "*" ServiceRequestOffer : recibe ofertas
    
    %% Relaciones de Técnico
    Technician "1" --> "*" ServiceRequest : atiende
    Technician "1" --> "*" ServiceRequestOffer : hace ofertas
    Technician "1" --> "*" AlternativeDateProposal : propone fechas
    Technician "*" --> "*" ApplianceType : se especializa en
    
    %% Relaciones de Solicitudes de Servicio
    ServiceRequest "1" --> "*" ServiceRequestOffer : tiene ofertas
    ServiceRequest "1" --> "*" AlternativeDateProposal : tiene propuestas
    ServiceRequest "*" --> "1" Appliance : para electrodoméstico
    ServiceRequest "*" --> "1" Address : en dirección
    ServiceRequest "1" --> "0..1" Rating : genera calificación
    ServiceRequest "1" --> "*" HelpTicket : puede generar tickets
    
    %% Relaciones de Electrodomésticos
    ApplianceType "1" --> "*" ApplianceBrand : tiene marcas
    ApplianceBrand "1" --> "*" ApplianceModel : tiene modelos
    
    %% Relaciones de Direcciones
    Identity "1" --> "*" Address : tiene direcciones
    Identity "1" --> "0..1" Address : dirección principal
    
    %% Relaciones de Calificaciones
    Identity "1" --> "*" Rating : emite calificaciones
    Identity "1" --> "*" Rating : recibe calificaciones
    
    %% Relaciones de Notificaciones
    Identity "1" --> "*" Notification : recibe notificaciones
    
    %% Relaciones de Tickets de Ayuda
    Identity "1" --> "*" HelpTicket : crea tickets
    Identity "1" --> "*" HelpTicket : administra tickets
    Identity "1" --> "*" HelpTicket : resuelve tickets