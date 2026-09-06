// Thin alias so components can `import { useAuth } from "../hooks/useAuth"`
// per the project's existing hooks/ convention, while the actual state
// lives in AuthContext.
export { useAuthContext as useAuth } from "../context/AuthContext";