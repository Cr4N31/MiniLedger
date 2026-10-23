# MiniLedger

MiniLedger is a React Native application for tracking money lent to friends. It allows users to record loans, monitor repayment status, identify overdue payments, and view a summary of their lending activity.

## Features

- **Phone number authentication:** Mock OTP login for development.
- **Loan management:** Create and view loan entries.
- **Repayment tracking:** Mark loans as repaid.
- **Financial summary:** View total lent, total repaid, and overdue amounts.
- **Overdue tracking:** Identify loans that have passed their due dates.
- **PostgreSQL database:** Persist loan and authentication data.

## Tech Stack

### Mobile App

- React Native
- Expo
- Expo Router
- TypeScript

### Backend

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- JSON Web Tokens (JWT)

## Prerequisites

Install the following before running the project:

- [Node.js](https://nodejs.org/) — preferably an active LTS version.
- npm, included with Node.js.
- [PostgreSQL](https://www.postgresql.org/download/).
- [Expo Go](https://expo.dev/go/) on a compatible mobile device, or an Android emulator.
- Git.

## Project Structure

The repository contains the mobile application and backend. Your exact folder structure may differ.

```text
MiniLedger/
├── backend/          # Express API and PostgreSQL integration
├── miniledger/       # React Native / Expo application
└── README.md
```

## 1. Clone the Repository

```bash
git clone https://github.com/Cr4N31/MiniLedger
cd MiniLedger
```

Replace the repository URL with your actual GitHub repository URL.

## 2. Configure PostgreSQL

Create a PostgreSQL database for MiniLedger using your preferred PostgreSQL client.

For example, from `psql`:

```sql
CREATE DATABASE miniledger;
```

Configure the backend to connect to this database using the connection settings expected by your application.

Make sure the required database tables are created using the project's existing schema or migration instructions.

## 3. Run the Backend

Open a terminal in the backend directory:

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory and configure the environment variables expected by the backend.

Example:

```env
PORT=3000
DATABASE_URL=postgresql://YOUR_DB_USER:YOUR_DB_PASSWORD@localhost:5432/miniledger
JWT_SECRET=replace_with_a_secure_random_secret
```

Use the actual environment variable names expected by your backend if they differ from these examples. Never commit real credentials or secrets to GitHub.

Start the development server using the script defined in `backend/package.json`. For example, if the project has a `dev` script:

```bash
npm run dev
```

The API should be available at:

```text
http://localhost:3000
```

Check that the server starts successfully and that the database connection works.

### Mock OTP Login

1. Enter a phone number in the application.
2. Request an OTP.
3. Check the backend terminal for the generated OTP.
4. Enter the OTP in the application to authenticate.

The OTP is printed to the server log for development purposes. This is a mock authentication flow, not a production SMS service.

## 4. Configure the Mobile App

Open a separate terminal and navigate to the Expo application directory:

```bash
cd miniledger
npm install
```

Create a `.env` file in the mobile app directory:

```env
EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_LAN_IP:3000
```

Replace `YOUR_COMPUTER_LAN_IP` with your computer's local network IP address.

For example:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.10:3000
```

**Important:** When using Expo Go on a physical phone, do not use `localhost` or `127.0.0.1` for the backend URL. Those addresses refer to the phone itself. Your phone and computer should be connected to the same network, and your firewall must allow access to the backend port.

For an Android emulator, `10.0.2.2` commonly maps to the host computer. Other emulator configurations may use a different address.

If your app uses a development JWT token, configure it only if required by the existing development setup. Do not commit tokens to GitHub.

## 5. Start the Expo App

From the mobile app directory, run:

```bash
npx expo start
```

Then:

- **Physical device:** Scan the QR code with Expo Go.
- **Android emulator:** Press `a` in the Expo terminal when an emulator is available.
- **Web:** Press `w` if the project supports web.

If you change environment variables, restart Expo so the updated configuration is loaded.

## 6. API Endpoints

The backend exposes the following endpoints:

| Method | Endpoint               | Description                 |
| ------ | ---------------------- | --------------------------- |
| GET    | `/health`              | Check server health         |
| POST   | `/api/auth/send-otp`   | Request a mock OTP          |
| POST   | `/api/auth/verify-otp` | Verify OTP and obtain a JWT |
| GET    | `/api/loans`           | Retrieve loan entries       |
| POST   | `/api/loans`           | Create a loan entry         |
| PATCH  | `/api/loans/:id/repay` | Mark a loan as repaid       |
| GET    | `/api/loans/summary`   | Retrieve financial summary  |

Authenticated loan endpoints require a valid JWT in the request's `Authorization` header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Example: Request an OTP

```json
{
  "phone": "+2348012345678"
}
```

### Example: Verify an OTP

```json
{
  "phone": "+2348012345678",
  "otp": "123456"
}
```

The OTP above is illustrative. Use the actual code printed by the running backend.

### Example: Create a Loan

```json
{
  "friendName": "Alex",
  "amount": 500,
  "dueDate": "2026-11-15"
}
```

The request body should match the field names and formats expected by the implemented API.

### Summary Response

The summary endpoint returns a summary containing:

- `totalLent`
- `totalRepaid`
- `overdueAmount`
- `unpaidLoans`
- `overdueLoans`

The response is wrapped in a `summary` object.

## 7. Verify the Application

Use the following checklist to verify the core functionality:

- [ ] The backend starts and connects to PostgreSQL.
- [ ] The health endpoint responds successfully.
- [ ] An OTP is printed in the backend terminal.
- [ ] Valid OTP verification returns an authentication token.
- [ ] A loan can be created and displayed in the app.
- [ ] Overdue loans are highlighted.
- [ ] A loan can be marked as repaid.
- [ ] The financial summary displays the correct totals.
- [ ] The app refreshes its data after a loan is added or repaid.

## 8. Troubleshooting

**The app cannot connect to the backend**

- Check the API URL in the mobile `.env` file.
- Confirm that the backend is running.
- Verify that the phone and computer share the same network.
- Check firewall settings.

**OTP verification fails**

- Confirm that the phone number matches the one used to request the OTP.
- Use the OTP printed in the backend terminal.
- Check whether the OTP has expired.

**Database connection fails**

- Verify that PostgreSQL is running.
- Check the database name, username, password, host, and port.
- Ensure the required tables have been created.

**Loan requests return an authentication error**

- Verify that the login flow completed successfully.
- Check that the JWT is being sent in the `Authorization` header.
- Confirm that the token has not expired.

## Security Notes

- Do not commit `.env` files, database passwords, JWT secrets, or authentication tokens.
- Keep `.env` files in `.gitignore`.
- Mock OTP delivery is intended for development and demonstration only.
- Production deployment requires appropriate authentication, input validation, and secret management.

## License

This project was developed as part of a Full Stack Development internship assignment.
