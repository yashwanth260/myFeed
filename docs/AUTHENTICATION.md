# Authentication & Authorization Architecture

## 1. Dual-Token Architecture

The platform uses a hardened dual-token JWT mechanism:

| Token Type | Lifespan | Storage | Payload |
| :--- | :--- | :--- | :--- |
| **Access Token** | 15 Minutes | In-Memory (HTTP Authorization Header: `Bearer <token>`) | `userId`, `role`, `email` |
| **Refresh Token** | 30 Days | HttpOnly, Secure, SameSite Cookie (or secure local storage in mobile apps) | Cryptographic Session UUID |

---

## 2. Password Hashing Specification
- Algorithm: **Bcrypt** with 10 salt rounds (or Argon2id).
- Passwords must be at least 8 characters with at least one number and one special character.
- Plaintext passwords or password hashes are never returned in user queries (`omit: { passwordHash: true }`).

---

## 3. Role-Based Access Control Matrix

| Endpoint Route | Customer | Restaurant Partner | Delivery Partner | Platform Admin |
| :--- | :---: | :---: | :---: | :---: |
| `POST /api/v1/orders` | ✅ (Self) | ❌ | ❌ | ❌ |
| `GET /api/v1/orders/:id` | ✅ (Self) | ✅ (Assigned) | ✅ (Assigned) | ✅ (All) |
| `POST /api/v1/restaurants/me/menu` | ❌ | ✅ (Self) | ❌ | ✅ (All) |
| `POST /api/v1/delivery/tasks/:id/accept` | ❌ | ❌ | ✅ (Assigned) | ❌ |
| `POST /api/v1/admin/restaurants/:id/approve` | ❌ | ❌ | ❌ | ✅ |
| `GET /api/v1/admin/settlements` | ❌ | ❌ | ❌ | ✅ |

