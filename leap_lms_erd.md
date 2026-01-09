```mermaid
erDiagram
    %% Lookup System
    LookupTypes {
        bigint id PK
        uuid uuid UK "NOT NULL"
        string name UK
        string code UK
        string description
        bigint parent_id FK "Self-reference"
        jsonb metadata "Additional flexible data"
        int sort_order
        boolean isActive
        boolean isDeleted
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt
    }
    
    Lookups {
        bigint id PK
        uuid uuid UK "NOT NULL"
        bigint lookup_type_id FK
        bigint parent_id FK "Self-reference for hierarchical lookups"
        string code UK
        string name_en
        string name_ar
        string description_en
        string description_ar
        string timezone "For timezone lookups"
        jsonb metadata "Additional flexible data"
        int sort_order
        int display_order
        boolean isActive
        boolean isDeleted
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt
    }

    %% User Management
    Users {
        bigint id PK
        uuid uuid UK "NOT NULL"
        string username UK
        string email UK
        string password_hash
        string firstName
        string lastName
        string phone
        text bio
        string avatar_url
        string resume_url
        bigint role_id FK
        bigint status_id FK
        string preferred_language "en/ar"
        string timezone
        timestamptz email_verified_at
        timestamptz last_login_at
        timestamptz last_seen_at
        boolean isOnline
        boolean isActive
        boolean isDeleted
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt
    }

    %% Subscription Module
    Plans {
        bigint id PK
        uuid uuid UK "NOT NULL"
        string name_en
        string name_ar
        text description_en
        text description_ar
        decimal price_monthly
        decimal price_quarterly
        decimal price_annual
        int max_courses "NULL for unlimited"
        boolean isActive
        boolean isDeleted
        int display_order
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt
    }

    PlanFeatures {
        bigint id PK
        uuid uuid UK "NOT NULL"
        bigint plan_id FK
        bigint feature_id FK "Lookup"
        string feature_value
        boolean isDeleted
        timestamptz createdAt
        timestamptz deletedAt
    }

    Subscriptions {
        bigint id PK
        uuid uuid UK "NOT NULL"
        bigint userId FK
        bigint plan_id FK
        bigint status_id FK "Lookup"
        bigint billing_cycle_id FK "Lookup"
        decimal amount_paid
        timestamptz start_date
        timestamptz end_date
        timestamptz cancelled_at
        boolean auto_renew
        boolean isDeleted
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt
    }

    PaymentHistory {
        bigint id PK
        uuid uuid UK "NOT NULL"
        bigint subscription_id FK
        bigint userId FK
        decimal amount
        string currency
        string payment_method
        string transaction_id
        string invoice_number UK
        string invoice_url
        bigint status_id FK "Lookup"
        timestamptz payment_date
        boolean isDeleted
        timestamptz createdAt
        timestamptz deletedAt
    }

    %% LMS Module
    CourseCategories {
        bigint id PK
        uuid uuid UK "NOT NULL"
        string name_en
        string name_ar
        string slug UK
        text description_en
        text description_ar
        bigint parent_id FK
        int display_order
        boolean isActive
        boolean isDeleted
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt
    }

    Courses {
        bigint id PK
        uuid uuid UK "NOT NULL"
        string title_en
        string title_ar
        string slug UK
        text description_en
        text description_ar
        text objectives_en
        text objectives_ar
        text requirements_en
        text requirements_ar
        jsonb seo "meta_title, meta_description, keywords, og_tags, schema_markup per language"
        bigint instructor_id FK
        bigint category_id FK
        bigint status_id FK "Lookup"
        bigint enrollment_type_id FK "Lookup"
        decimal price "For one-time purchase"
        string thumbnail_url
        string video_url
        int duration_hours
        int max_students
        boolean allow_subscription_access
        boolean allow_purchase
        timestamptz publish_date
        boolean is_featured
        boolean isDeleted
        int view_count
        int favorite_count
        int share_count
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt
    }

    CourseSections {
        bigint id PK
        uuid uuid UK "NOT NULL"
        bigint course_id FK
        string title_en
        string title_ar
        text description_en
        text description_ar
        int display_order
        boolean isDeleted
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt
    }

    Lessons {
        bigint id PK
        uuid uuid UK "NOT NULL"
        bigint section_id FK
        bigint content_type_id FK "Lookup"
        string title_en
        string title_ar
        text description_en
        text description_ar
        text content_en
        text content_ar
        string video_url
        string attachment_url
        int duration_minutes
        int display_order
        boolean is_preview
        boolean isDeleted
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt
    }

    CourseResources {
        bigint id PK
        uuid uuid UK "NOT NULL"
        bigint course_id FK
        bigint section_id FK "NULL for course-level"
        bigint lesson_id FK "NULL for section-level"
        bigint resource_type_id FK "Lookup"
        string title_en
        string title_ar
        text description_en
        text description_ar
        string file_url
        string file_name
        int file_size
        int download_count
        int display_order
        boolean isDeleted
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt
    }

    Assignments {
        bigint id PK
        uuid uuid UK "NOT NULL"
        bigint section_id FK
        string title_en
        string title_ar
        text description_en
        text description_ar
        text instructions_en
        text instructions_ar
        int max_points
        timestamptz due_date
        int max_attempts
        boolean allow_late_submission
        boolean isDeleted
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt
    }

    Quizzes {
        bigint id PK
        uuid uuid UK "NOT NULL"
        bigint section_id FK
        string title_en
        string title_ar
        text description_en
        text description_ar
        int time_limit_minutes
        int max_attempts
        int passing_score
        boolean shuffle_questions
        boolean show_correct_answers
        timestamptz available_from
        timestamptz available_until
        boolean isDeleted
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt
    }

    QuestionBank {
        bigint id PK
        uuid uuid UK "NOT NULL"
        bigint course_id FK
        bigint question_type_id FK "Lookup"
        text question_text_en
        text question_text_ar
        text explanation_en
        text explanation_ar
        int points
        boolean isDeleted
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt
    }

    QuestionOptions {
        bigint id PK
        uuid uuid UK "NOT NULL"
        bigint question_id FK
        text option_text_en
        text option_text_ar
        boolean is_correct
        int display_order
        boolean isDeleted
        timestamptz createdAt
        timestamptz deletedAt
    }

    QuizQuestions {
        bigint id PK
        uuid uuid UK "NOT NULL"
        bigint quiz_id FK
        bigint question_id FK
        int display_order
        boolean isDeleted
        timestamptz createdAt
        timestamptz deletedAt
    }

    Enrollments {
        bigint id PK
        uuid uuid UK "NOT NULL"
        bigint userId FK
        bigint course_id FK
        bigint enrollment_type_id FK "Lookup: Purchase/Subscription"
        bigint status_id FK "Lookup"
        bigint subscription_id FK "NULL if purchased"
        decimal amount_paid "For purchases"
        timestamptz enrolled_at
        timestamptz expires_at "NULL for purchases"
        timestamptz completed_at
        decimal progress_percentage
        timestamptz last_accessed_at
        boolean isDeleted
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt
    }

    LessonProgress {
        bigint id PK
        uuid uuid UK "NOT NULL"
        bigint enrollment_id FK
        bigint lesson_id FK
        boolean is_completed
        int time_spent_minutes
        timestamptz completed_at
        timestamptz last_accessed_at
        boolean isDeleted
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt
    }

    AssignmentSubmissions {
        bigint id PK
        uuid uuid UK "NOT NULL"
        bigint assignment_id FK
        bigint userId FK
        text submission_text
        string file_url
        bigint status_id FK "Lookup"
        decimal score
        decimal max_points
        text feedback
        timestamptz submitted_at
        timestamptz graded_at
        bigint graded_by FK
        boolean isDeleted
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt
    }

    QuizAttempts {
        bigint id PK
        uuid uuid UK "NOT NULL"
        bigint quiz_id FK
        bigint userId FK
        int attempt_number
        decimal score
        decimal max_score
        boolean is_passed
        timestamptz started_at
        timestamptz completed_at
        boolean isDeleted
        timestamptz createdAt
        timestamptz deletedAt
    }

    QuizAnswers {
        bigint id PK
        uuid uuid UK "NOT NULL"
        bigint attempt_id FK
        bigint question_id FK
        bigint selected_option_id FK
        text answer_text
        boolean is_correct
        decimal points_earned
        boolean isDeleted
        timestamptz createdAt
        timestamptz deletedAt
    }

    CourseReviews {
        bigint id PK
        uuid uuid UK "NOT NULL"
        bigint course_id FK
        bigint userId FK
        int rating
        text review_text
        boolean isDeleted
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt
    }

    Certificates {
        bigint id PK
        uuid uuid UK "NOT NULL"
        bigint enrollment_id FK
        string certificate_number UK
        timestamptz issued_date
        string file_url
        string download_url
        int download_count
        boolean isDeleted
        timestamptz createdAt
        timestamptz deletedAt
    }

    %% Comments System (Universal)
    Comments {
        bigint id PK
        uuid uuid UK "NOT NULL"
        bigint userId FK
        string commentable_type "Course/Section/Lesson/Post/Event/etc"
        bigint commentable_id
        bigint parent_comment_id FK "For nested comments"
        text content
        int likes_count
        boolean isDeleted
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt
    }

    CommentReactions {
        bigint id PK
        uuid uuid UK "NOT NULL"
        bigint comment_id FK
        bigint userId FK
        bigint reaction_type_id FK "Lookup"
        boolean isDeleted
        timestamptz createdAt
        timestamptz deletedAt
    }

    %% Notes System (Private)
    Notes {
        bigint id PK
        uuid uuid UK "NOT NULL"
        bigint userId FK
        string noteable_type "Course/Section/Lesson/etc"
        bigint noteable_id
        bigint visibility_id FK "Lookup: Private/Public/Instructors Only"
        boolean is_pinned
        boolean is_archived
        text content
        string color "Note highlight color"
        int likes_count "For public notes"
        boolean isDeleted
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz archived_at
        timestamptz deletedAt
    }

    %% Social Module
    Posts {
        bigint id PK
        uuid uuid UK "NOT NULL"
        bigint userId FK
        bigint post_type_id FK "Lookup"
        text content
        bigint visibility_id FK "Lookup"
        bigint group_id FK
        bigint page_id FK
        int share_count
        int comment_count
        int reaction_count
        int view_count
        jsonb metadata
        jsonb settings
        boolean isDeleted
        timestamptz published_at "NULL "
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt
    }

    PostReactions {
        bigint id PK
        uuid uuid UK "NOT NULL"
        bigint post_id FK
        bigint userId FK
        bigint reaction_type_id FK "Lookup"
        boolean isDeleted
        timestamptz createdAt
        timestamptz deletedAt
    }

    Groups {
        bigint id PK
        uuid uuid UK "NOT NULL"
        string name
        string slug UK
        text description
        jsonb seo "meta_title, meta_description, keywords, og_tags"
        bigint privacy_type_id FK "Lookup"
        string cover_image_url
        bigint created_by FK
        int member_count
        int favorite_count
        boolean isDeleted
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt
    }

    GroupMembers {
        bigint id PK
        uuid uuid UK "NOT NULL"
        bigint group_id FK
        bigint userId FK
        bigint role_id FK "Lookup"
        bigint status_id FK "Lookup"
        timestamptz joined_at
        boolean isDeleted
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt
    }

    Pages {
        bigint id PK
        uuid uuid UK "NOT NULL"
        string name
        string slug UK
        text description
        jsonb seo "meta_title, meta_description, keywords, og_tags"
        bigint category_id FK
        string cover_image_url
        string profile_image_url
        bigint created_by FK
        int follower_count
        int like_count
        int favorite_count
        boolean isDeleted
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt
    }

    PageMembers {
        bigint id PK
        uuid uuid UK "NOT NULL"
        bigint page_id FK
        bigint userId FK
        bigint role_id FK "Lookup"
        timestamptz joined_at
        boolean isDeleted
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt
    }

    PageLikes {
        bigint id PK
        uuid uuid UK "NOT NULL"
        bigint page_id FK
        bigint userId FK
        boolean isDeleted
        timestamptz createdAt
        timestamptz deletedAt
    }

    PageFollows {
        bigint id PK
        uuid uuid UK "NOT NULL"
        bigint page_id FK
        bigint userId FK
        boolean isDeleted
        timestamptz createdAt
        timestamptz deletedAt
    }

    Friends {
        bigint id PK
        uuid uuid UK "NOT NULL"
        bigint userId FK
        bigint friend_id FK
        bigint status_id FK "Lookup"
        timestamptz requested_at
        timestamptz accepted_at
        boolean isDeleted
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt
    }

    %% Favorites Module (Universal)
    Favorites {
        bigint id PK
        uuid uuid UK "NOT NULL"
        bigint userId FK
        string favoritable_type "Course/Post/Event/Page/Group/Job"
        bigint favoritable_id
        boolean isDeleted
        timestamptz createdAt
        timestamptz deletedAt
    }

    %% Sharing Module
    Shares {
        bigint id PK
        uuid uuid UK "NOT NULL"
        bigint userId FK
        string shareable_type "Course/Post/Event/Page/Group/Job"
        bigint shareable_id
        bigint share_type_id FK "Lookup: Internal/External"
        bigint shared_to_group_id FK "NULL if not to group"
        string external_platform "facebook/twitter/email/etc"
        boolean isDeleted
        timestamptz createdAt
        timestamptz deletedAt
    }

    %% Chat Module
    ChatRooms {
        bigint id PK
        uuid uuid UK "NOT NULL"
        string name
        bigint chat_type_id FK "Lookup: Public/Private/Group"
        string roomable_type "Course/Group/NULL for private"
        bigint roomable_id
        bigint created_by FK
        timestamptz last_message_at
        boolean isDeleted
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt
    }

    ChatParticipants {
        bigint id PK
        uuid uuid UK "NOT NULL"
        bigint chat_room_id FK
        bigint userId FK
        boolean is_admin
        boolean is_muted
        timestamptz joined_at
        timestamptz left_at
        timestamptz last_read_at
        boolean isDeleted
        timestamptz createdAt
        timestamptz deletedAt
    }

    ChatMessages {
        bigint id PK
        uuid uuid UK "NOT NULL"
        bigint chat_room_id FK
        bigint userId FK
        text content
        string attachment_url
        bigint message_type_id FK "Lookup: Text/Image/File/Voice"
        bigint reply_to_message_id FK "For replies"
        boolean is_edited
        boolean isDeleted
        timestamptz edited_at
        timestamptz createdAt
        timestamptz deletedAt
    }

    MessageReads {
        bigint id PK
        uuid uuid UK "NOT NULL"
        bigint message_id FK
        bigint userId FK
        timestamptz read_at
        boolean isDeleted
        timestamptz createdAt
        timestamptz deletedAt
    }

    %% CMS Module
    CMSPages {
        bigint id PK
        uuid uuid UK "NOT NULL"
        string slug UK
        bigint page_type_id FK "Lookup"
        bigint status_id FK "Lookup"
        string title_en
        string title_ar
        text content_en
        text content_ar
        jsonb metadata "Additional page metadata"
        jsonb settings "Page settings"
        boolean is_published
        boolean isDeleted
        timestamptz published_at
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt
    }

    %% Storage Module
    MediaLibrary {
        bigint id PK
        uuid uuid UK "NOT NULL"
        bigint uploaded_by FK
        string mediable_type "Course/Post/Event/Job/User/etc or NULL for temp"
        bigint mediable_id "NULL for temporary uploads"
        bigint provider_id FK "Lookup: Local/S3/Minio/CloudflareR2/Backblaze/etc"
        string file_name
        string original_name
        string file_path
        string file_type
        string mime_type
        int file_size
        string alt_text
        jsonb metadata "Additional file properties, EXIF, width, height, etc"
        boolean is_temporary "True until attached to entity"
        timestamptz temp_expires_at "Auto-cleanup date for temp files"
        int download_count
        boolean isDeleted
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt
    }

    %% Events Module
    Events {
        bigint id PK
        uuid uuid UK "NOT NULL"
        string title_en
        string title_ar
        string slug UK
        text description_en
        text description_ar
        jsonb seo "meta_title, meta_description, keywords, og_tags, schema_markup per language"
        bigint event_type_id FK "Lookup"
        bigint status_id FK "Lookup"
        bigint category_id FK
        timestamptz start_date
        timestamptz end_date
        string location
        string timezone
        string meeting_url
        int capacity
        bigint created_by FK
        string banner_url
        boolean is_featured
        boolean isDeleted
        int registration_count
        int favorite_count
        int share_count
        int going_count
        int interested_count
        int maybe_count
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt
    }

    EventRegistrations {
        bigint id PK
        uuid uuid UK "NOT NULL"
        bigint event_id FK
        bigint userId FK
        bigint status_id FK "Lookup: Registered/Cancelled"
        bigint attendance_status_id FK "Lookup: Going/Interested/Maybe/Not Going"
        timestamptz registered_at
        timestamptz attended_at
        timestamptz cancelled_at
        boolean isDeleted
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt
    }

    EventCategories {
        bigint id PK
        uuid uuid UK "NOT NULL"
        string name_en
        string name_ar
        string slug UK
        text description_en
        text description_ar
        boolean isDeleted
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt
    }

    %% Ticketing Module
    Tickets {
        bigint id PK
        uuid uuid UK "NOT NULL"
        string ticket_number UK
        bigint userId FK
        bigint category_id FK "Lookup"
        bigint priority_id FK "Lookup"
        bigint status_id FK "Lookup"
        string subject
        text description
        bigint assigned_to FK
        timestamptz resolved_at
        timestamptz closed_at
        boolean isDeleted
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt
    }

    TicketReplies {
        bigint id PK
        uuid uuid UK "NOT NULL"
        bigint ticket_id FK
        bigint userId FK
        text message
        boolean is_internal
        string attachment_url
        boolean isDeleted
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt
    }

    Reports {
        bigint id PK
        uuid uuid UK "NOT NULL"
        bigint reported_by FK
        bigint report_type_id FK "Lookup"
        bigint status_id FK "Lookup"
        string reportable_type "Post/Page/User/Group/Course/Comment/ChatMessage/Job"
        bigint reportable_id
        text reason
        text admin_notes
        bigint reviewed_by FK
        timestamptz reviewed_at
        boolean isDeleted
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt
    }

    %% Jobs Module
    Jobs {
        bigint id PK
        uuid uuid UK "NOT NULL"
        string title_en
        string title_ar
        string slug UK
        text description_en
        text description_ar
        text requirements_en
        text requirements_ar
        text responsibilities_en
        text responsibilities_ar
        jsonb seo "meta_title, meta_description, keywords, og_tags, schema_markup per language"
        bigint job_type_id FK "Lookup: Full-time/Part-time/Contract/Freelance"
        bigint experience_level_id FK "Lookup: Entry/Mid/Senior"
        bigint status_id FK "Lookup: Open/Closed/Filled"
        string location
        string salary_range
        bigint posted_by FK
        bigint company_id FK "Can reference Pages"
        int application_count
        int view_count
        int favorite_count
        int share_count
        timestamptz deadline
        boolean is_featured
        boolean isDeleted
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt
    }

    JobApplications {
        bigint id PK
        uuid uuid UK "NOT NULL"
        bigint job_id FK
        bigint userId FK
        bigint status_id FK "Lookup: Applied/Reviewing/Shortlisted/Rejected/Accepted"
        text cover_letter
        string resume_url
        text notes
        bigint reviewed_by FK
        timestamptz reviewed_at
        timestamptz applied_at
        boolean isDeleted
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt
    }

    %% Notifications
    Notifications {
        bigint id PK
        uuid uuid UK "NOT NULL"
        bigint userId FK
        bigint notification_type_id FK "Lookup"
        string title
        text message
        string link_url
        boolean is_read
        boolean isDeleted
        timestamptz read_at
        timestamptz createdAt
        timestamptz deletedAt
    }

    %% Audit Log
    AuditLogs {
        bigint id PK
        uuid uuid UK "NOT NULL"
        bigint userId FK "NULL for system actions"
        string auditable_type "User/Course/Post/Job/etc"
        bigint auditable_id
        string action "created/updated/deleted/viewed/downloaded"
        jsonb old_values "Previous state"
        jsonb new_values "New state"
        text description
        string ip_address
        string user_agent
        timestamptz createdAt
    }

    %% Relationships
    LookupTypes ||--o{ LookupTypes : "parent"
    LookupTypes ||--o{ Lookups : "has"
    
    Lookups ||--o{ Lookups : "parent"
    
    Users ||--o{ Subscriptions : "subscribes"
    Users ||--o{ PaymentHistory : "pays"
    Users ||--o{ Courses : "instructs"
    Users ||--o{ Enrollments : "enrolls"
    Users ||--o{ Posts : "creates"
    Users ||--o{ Comments : "writes"
    Users ||--o{ Notes : "takes"
    Users ||--o{ GroupMembers : "joins"
    Users ||--o{ PageMembers : "manages"
    Users ||--o{ PageLikes : "likes"
    Users ||--o{ PageFollows : "follows"
    Users ||--o{ Friends : "has_friend"
    Users ||--o{ Friends : "is_friend_of"
    Users ||--o{ EventRegistrations : "registers"
    Users ||--o{ Tickets : "submits"
    Users ||--o{ Reports : "reports"
    Users ||--o{ Notifications : "receives"
    Users ||--o{ AssignmentSubmissions : "submits"
    Users ||--o{ QuizAttempts : "attempts"
    Users ||--o{ CourseReviews : "reviews"
    Users ||--o{ MediaLibrary : "uploads"
    Users ||--o{ Events : "creates"
    Users ||--o{ Favorites : "favorites"
    Users ||--o{ Shares : "shares"
    Users ||--o{ ChatRooms : "creates"
    Users ||--o{ ChatParticipants : "participates"
    Users ||--o{ ChatMessages : "sends"
    Users ||--o{ MessageReads : "reads"
    Users ||--o{ CommentReactions : "reacts"
    Users ||--o{ Jobs : "posts"
    Users ||--o{ JobApplications : "applies"
    Users ||--o{ AuditLogs : "performs"
    Users }o--|| Lookups : "has_role"
    Users }o--|| Lookups : "has_status"
    
    MediaLibrary }o--|| Lookups : "has_provider"
    
    Notes }o--|| Lookups : "has_visibility"
    
    Plans ||--o{ PlanFeatures : "has"
    Plans ||--o{ Subscriptions : "subscribed_to"
    
    PlanFeatures }o--|| Lookups : "has_feature"
    
    Subscriptions ||--o{ PaymentHistory : "tracks"
    Subscriptions ||--o{ Enrollments : "grants_access"
    Subscriptions }o--|| Lookups : "has_status"
    Subscriptions }o--|| Lookups : "has_billing_cycle"
    
    CourseCategories ||--o{ Courses : "categorizes"
    CourseCategories ||--o{ CourseCategories : "parent"
    
    Courses ||--o{ CourseSections : "contains"
    Courses ||--o{ CourseResources : "has"
    Courses ||--o{ Enrollments : "has"
    Courses ||--o{ CourseReviews : "receives"
    Courses ||--o{ QuestionBank : "has"
    Courses }o--|| Lookups : "has_status"
    Courses }o--|| Lookups : "has_enrollment_type"
    
    CourseSections ||--o{ Lessons : "contains"
    CourseSections ||--o{ Assignments : "contains"
    CourseSections ||--o{ Quizzes : "contains"
    CourseSections ||--o{ CourseResources : "has"
    
    Lessons ||--o{ CourseResources : "has"
    Lessons }o--|| Lookups : "has_content_type"
    
    CourseResources }o--|| Lookups : "has_resource_type"
    
    QuestionBank ||--o{ QuestionOptions : "has"
    QuestionBank ||--o{ QuizQuestions : "used_in"
    QuestionBank }o--|| Lookups : "has_question_type"
    
    Quizzes ||--o{ QuizQuestions : "contains"
    Quizzes ||--o{ QuizAttempts : "has"
    
    Assignments ||--o{ AssignmentSubmissions : "receives"
    
    AssignmentSubmissions }o--|| Lookups : "has_status"
    AssignmentSubmissions }o--|| Users : "graded_by"
    
    Enrollments ||--o{ LessonProgress : "tracks"
    Enrollments ||--o{ Certificates : "earns"
    Enrollments }o--|| Lookups : "has_enrollment_type"
    Enrollments }o--|| Lookups : "has_status"
    
    LessonProgress }o--|| Lessons : "tracks"
    
    QuizAttempts ||--o{ QuizAnswers : "contains"
    
    QuizAnswers }o--|| QuestionOptions : "selects"
    
    Comments ||--o{ Comments : "parent"
    Comments ||--o{ CommentReactions : "receives"
    
    CommentReactions }o--|| Lookups : "has_reaction_type"
    
    Posts ||--o{ PostReactions : "receives"
    Posts ||--o{ MediaLibrary : "has_media"
    Posts }o--|| Lookups : "has_post_type"
    Posts }o--|| Lookups : "has_visibility"
    Posts }o--|| Groups : "posted_in"
    Posts }o--|| Pages : "posted_on"
    
    PostReactions }o--|| Lookups : "has_reaction_type"
    
    Groups ||--o{ GroupMembers : "has"
    Groups ||--o{ Posts : "contains"
    Groups }o--|| Lookups : "has_privacy_type"
    Groups }o--|| Users : "created_by"
    
    GroupMembers }o--|| Lookups : "has_role"
    GroupMembers }o--|| Lookups : "has_status"
    
    Pages ||--o{ PageMembers : "has"
    Pages ||--o{ PageLikes : "receives"
    Pages ||--o{ PageFollows : "receives"
    Pages ||--o{ Posts : "contains"
    Pages }o--|| Users : "created_by"
    
    PageMembers }o--|| Lookups : "has_role"
    
    Friends }o--|| Lookups : "has_status"
    
    ChatRooms ||--o{ ChatParticipants : "has"
    ChatRooms ||--o{ ChatMessages : "contains"
    ChatRooms }o--|| Lookups : "has_chat_type"
    
    ChatMessages ||--o{ MessageReads : "tracks"
    ChatMessages ||--o{ ChatMessages : "replies_to"
    ChatMessages }o--|| Lookups : "has_message_type"
    
    CMSPages }o--|| Lookups : "has_page_type"
    CMSPages }o--|| Lookups : "has_status"
    
    EventCategories ||--o{ Events : "categorizes"
    
    Events ||--o{ EventRegistrations : "has"
    Events }o--|| Lookups : "has_event_type"
    Events }o--|| Lookups : "has_status"
    
    EventRegistrations }o--|| Lookups : "has_status"
    EventRegistrations }o--|| Lookups : "has_attendance_status"
    
    Jobs ||--o{ JobApplications : "receives"
    Jobs }o--|| Lookups : "has_job_type"
    Jobs }o--|| Lookups : "has_experience_level"
    Jobs }o--|| Lookups : "has_status"
    Jobs }o--|| Users : "posted_by"
    Jobs }o--|| Pages : "company"
    
    JobApplications }o--|| Lookups : "has_status"
    JobApplications }o--|| Users : "reviewed_by"
    
    Tickets ||--o{ TicketReplies : "has"
    Tickets }o--|| Lookups : "has_category"
    Tickets }o--|| Lookups : "has_priority"
    Tickets }o--|| Lookups : "has_status"
    Tickets }o--|| Users : "assigned_to"
    
    Reports }o--|| Lookups : "has_report_type"
    Reports }o--|| Lookups : "has_status"
    Reports }o--|| Users : "reviewed_by"
    
    Notifications }o--|| Lookups : "has_notification_type"
```