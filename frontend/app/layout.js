import "./globals.css";
import { ApiProvider } from "../context/ApiContext";
export const metadata = {
  title: "ExamPortal - Modern Online Examination Platform",
  description: "Transform your testing experience with our secure, feature-rich online examination platform. Conduct exams with confidence and get instant results.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ApiProvider>
          {children}
        </ApiProvider>
      </body>
    </html>
  );
}
