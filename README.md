# IT Company Backend

## PostgreSQL Database Setup with TypeORM

This NestJS application uses TypeORM to connect to a PostgreSQL database.

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)

### Database Configuration

The database connection is configured using environment variables. Create a `.env` file in the root directory with the following variables:

```bash
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=it_company
```

Adjust these values according to your PostgreSQL setup.

### Installation

```bash
# Install dependencies
npm install
```

### Running the application

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

### Database Entities

The application includes the following entities:

- **User**: Represents a user in the system with fields for firstName, lastName, email, password, etc.

### API Endpoints

#### Users

- `GET /users` - Get all users
- `GET /users/:id` - Get a specific user by ID
- `POST /users` - Create a new user
- `PUT /users/:id` - Update a user
- `DELETE /users/:id` - Delete a user

### TypeORM Configuration

TypeORM is configured in `src/config/database.config.ts` and integrated into the application in `src/app.module.ts`.

Key configuration options:

- `synchronize`: Automatically creates database tables based on entities (set to `false` in production)
- `logging`: Logs SQL queries (disabled in production)
- `entities`: Path pattern to entity files

### Adding New Entities

To add a new entity:

1. Create a new entity file in the appropriate module directory
2. Define the entity class with TypeORM decorators
3. Create corresponding DTOs, service, and controller
4. Import the entity in the module's `forFeature` method

Example:

```typescript
@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, nullable: false })
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;
}
```

### Migrations

For production environments, it's recommended to use migrations instead of `synchronize: true`.

To generate and run migrations:

```bash
# Generate a migration
npx typeorm migration:generate -n MigrationName

# Run migrations
npx typeorm migration:run
```

### WebSocket Events

The application uses WebSockets to handle real-time chat functionality. Below are the WebSocket events and their descriptions:

#### Chats Gateway

- **createChat**
  - **Description**: Create a new chat.
  - **Payload**: `CreateChatDto`
  - **Emits**: `chatCreated` with the created chat object.

- **sendMessage**
  - **Description**: Send a message in a chat.
  - **Payload**: `CreateMessageDto`
  - **Emits**: `messageSent` with the sent message object.

- **removeUserFromGroup**
  - **Description**: Remove a user from a group chat.
  - **Payload**: `{ chatId: number, userId: string }`
  - **Emits**: `userRemovedFromGroup` with the chat ID and user ID.

- **blockUser**
  - **Description**: Block a user in a private chat.
  - **Payload**: `{ userId: string, blockedUserId: string }`
  - **Emits**: `userBlocked` with the user ID and blocked user ID.
