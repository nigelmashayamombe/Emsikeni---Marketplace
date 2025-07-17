project-root/
├── src/
│   ├── config/                  # Environment & third-party setup
│   │   ├── index.ts             # Loads .env, selects config by NODE_ENV
│   │   └── logger.ts            # Central Winston/​Pino logger
│   │
│   ├── interfaces/              # TypeScript interfaces & contracts
│   │   ├── IRepository.ts       # e.g. CRUD interface
│   │   └── IUserService.ts      # Service interface
│   │
│   ├── models/                  # Domain entities / ORM models
│   │   └── User.ts              # Entity class with validation, methods
│   │
│   ├── dtos/                    # Data Transfer Objects (input/output shapes)
│   │   ├── CreateUserDto.ts
│   │   └── UpdateUserDto.ts
│   │
│   ├── repositories/            # Data access implementations
│   │   ├── BaseRepository.ts    # Generic CRUD, implements IRepository<T>
│   │   └── UserRepository.ts    # extends BaseRepository<User>
│   │
│   ├── services/                # Business logic / use‐case layer
│   │   ├── BaseService.ts       # Common logic (e.g. paging), depends on IRepository<T>
/// │   └── UserService.ts         # Implements IUserService; depends on IUserRepo interface
│   │
│   ├── controllers/             # HTTP handlers / presentation layer
│   │   ├── BaseController.ts    # Error handling, response formatting
│   │   └── UserController.ts    # Injects UserService; defines Express routes
│   │
│   ├── routes/                  # Express route definitions
│   │   └── user.routes.ts       # `router.get('/', userController.index)` etc.
│   │
│   ├── middlewares/             # Reusable Express middleware
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts  # Centralized error → HTTP responses
│   │
│   ├── utils/                   # DRY helpers (date formatting, pagination)
│   │   └── pagination.ts
│   │
│   ├── errors/                  # Custom error classes
│   │   └── NotFoundError.ts
│   │
│   ├── container.ts             # IoC container setup (e.g. inversify, tsyringe)
│   ├── app.ts                   # Express app factory: applies middleware, routes
│   └── server.ts                # Bootstraps app.listen()
│
└── tests/                       # Mirror src structure for unit/integration tests
    ├── services/
    ├── controllers/
    └── repositories/
