# Purely Platonic - Database Schema

## Tables Overview

### 1. users
Core user profile information and preferences.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| name | text | NO | - | User's display name |
| email | text | NO | - | User's email (unique) |
| gender | text[] | NO | '{}' | User's gender identity (array) |
| looking_for | text[] | NO | '{}' | Gender preferences for friends |
| social_style | text | NO | - | introvert/ambivert/extrovert |
| interests | jsonb | NO | '[]' | Array of interests |
| headline | text | YES | - | Short profile headline |
| about_me | text | YES | - | Bio/description |
| profile_picture | text | YES | - | URL to profile image |
| location | jsonb | YES | - | Location data |
| verification_status | text | YES | 'unverified' | unverified/pending/verified/rejected |
| verification_photo | text | YES | - | URL to verification photo |
| created_at | timestamptz | YES | now() | Account creation timestamp |
| updated_at | timestamptz | YES | now() | Last update timestamp |

**RLS Enabled:** Yes

---

### 2. matches
Tracks connections between users (swipes/likes).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| user1_id | uuid | YES | - | First user (FK to users) |
| user2_id | uuid | YES | - | Second user (FK to users) |
| status | text | NO | - | pending/accepted/declined |
| is_super_like | boolean | YES | false | Whether this is a super like |
| created_at | timestamptz | YES | now() | Match creation timestamp |
| updated_at | timestamptz | YES | now() | Last update timestamp |

**RLS Enabled:** Yes

**Foreign Keys:**
- user1_id → users.id
- user2_id → users.id

---

### 3. messages
Chat messages between matched users.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| match_id | uuid | YES | - | Related match (FK to matches) |
| sender_id | uuid | YES | - | Message sender (FK to users) |
| content | text | NO | - | Message text |
| is_read | boolean | YES | false | Read status |
| created_at | timestamptz | YES | now() | Message timestamp |

**RLS Enabled:** Yes

**Foreign Keys:**
- match_id → matches.id
- sender_id → users.id

---

### 4. meetup_invites
In-person meetup invitations between matches.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| sender_id | uuid | YES | - | Invite sender (FK to users) |
| receiver_id | uuid | YES | - | Invite receiver (FK to users) |
| match_id | uuid | YES | - | Related match (FK to matches) |
| place | jsonb | NO | - | Location details (name, address, etc) |
| datetime | timestamptz | NO | - | Proposed meetup time |
| proposed_datetime | timestamptz | YES | - | Alternative time proposed by receiver |
| message | text | YES | - | Optional message |
| status | text | NO | 'pending' | pending/accepted/declined/cancelled/proposed_change |
| created_at | timestamptz | YES | now() | Creation timestamp |
| updated_at | timestamptz | YES | now() | Last update timestamp |

**RLS Enabled:** Yes

**Foreign Keys:**
- sender_id → users.id
- receiver_id → users.id
- match_id → matches.id

---

### 5. verification_requests
User verification photo submissions for review.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| user_id | uuid | YES | - | User requesting verification (FK to users) |
| photo_url | text | NO | - | Verification photo URL |
| status | text | NO | 'pending' | pending/approved/rejected |
| admin_notes | text | YES | - | Admin review notes |
| submitted_at | timestamptz | YES | now() | Submission timestamp |
| reviewed_at | timestamptz | YES | - | Review timestamp |
| created_at | timestamptz | YES | now() | Creation timestamp |
| updated_at | timestamptz | YES | now() | Last update timestamp |

**RLS Enabled:** Yes

**Foreign Keys:**
- user_id → users.id

---

### 6. device_tokens
Push notification device tokens for mobile apps.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| user_id | uuid | NO | - | Device owner (FK to users) |
| token | text | NO | - | Push notification token |
| platform | text | NO | - | android/ios/web |
| created_at | timestamptz | YES | now() | Creation timestamp |
| updated_at | timestamptz | YES | now() | Last update timestamp |

**RLS Enabled:** Yes

**Foreign Keys:**
- user_id → users.id

---

### 7. couples
Tracks coupled/married users who want to make friends together.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| user1_id | uuid | NO | - | First partner (FK to auth.users) |
| user2_id | uuid | NO | - | Second partner (FK to auth.users) |
| pending_user_id | uuid | YES | - | User who initiated link (FK to auth.users) |
| status | text | NO | - | married/couple |
| confirmed | boolean | YES | false | Whether both partners confirmed |
| linked_at | timestamptz | YES | now() | Link confirmation timestamp |
| created_at | timestamptz | YES | now() | Creation timestamp |

**RLS Enabled:** Yes

**Foreign Keys:**
- user1_id → auth.users.id
- user2_id → auth.users.id
- pending_user_id → auth.users.id

---

## Key Features

- All tables use UUID primary keys
- Timestamps track creation and updates
- Row Level Security (RLS) enabled on all tables
- Foreign key constraints maintain referential integrity
- Check constraints enforce valid enum values
- JSONB columns for flexible data (interests, location, place details)
- Array columns for multi-select fields (gender, looking_for)

## Authentication

The app uses Supabase Auth with the `auth.users` table. The `couples` table references `auth.users.id` while other user references point to the `public.users` table.
