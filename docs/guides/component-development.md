# Guía de Desarrollo de Componentes

## 📋 Descripción

Esta guía establece las convenciones, patrones y mejores prácticas para el desarrollo de componentes en FUSIONCOL Frontend. Siguiendo estas pautas aseguraremos código consistente, mantenible y escalable.

## 🏗️ Estructura de Componentes

### Organización de Archivos

```
src/components/
├── ui/                    # Componentes base reutilizables
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   ├── Button.stories.tsx
│   │   └── index.ts
│   └── Input/
├── chat/                  # Componentes específicos del chat
│   ├── ChatModal/
│   ├── MessageList/
│   └── ConversationItem/
├── workflow/              # Componentes del editor de workflows
│   ├── WorkflowEditor/
│   ├── NodeSidebar/
│   └── PropertiesPanel/
└── common/                # Componentes comunes
    ├── Layout/
    ├── Navigation/
    └── ErrorBoundary/
```

### Convenciones de Nomenclatura

- **Componentes**: PascalCase (`Button`, `ChatModal`, `WorkflowEditor`)
- **Archivos**: PascalCase para componentes (`Button.tsx`)
- **Carpetas**: PascalCase para componentes (`Button/`)
- **Props**: camelCase (`isLoading`, `onClick`)
- **Hooks**: camelCase con prefijo `use` (`useChat`, `useWorkflow`)

## 🎯 Anatomía de un Componente

### Estructura Base

```tsx
// src/components/ui/Button/Button.tsx
import React from "react";
import { cn } from "../../../utils/cn";

// 1. Definir interfaces
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// 2. Componente principal
export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}) => {
  // 3. Lógica del componente
  const isDisabled = disabled || isLoading;

  // 4. Clases CSS
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary:
      "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const disabledClasses = "opacity-50 cursor-not-allowed";

  // 5. Render
  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        isDisabled && disabledClasses,
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

// 6. Export por defecto
export default Button;
```

### Archivo de Índice

```tsx
// src/components/ui/Button/index.ts
export { Button } from "./Button";
export type { ButtonProps } from "./Button";
```

## 🎨 Patrones de Componentes

### 1. **Compound Components**

Para componentes complejos con múltiples partes:

```tsx
// Modal compound component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

interface ModalHeaderProps {
  children: React.ReactNode;
}

interface ModalBodyProps {
  children: React.ReactNode;
}

interface ModalFooterProps {
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> & {
  Header: React.FC<ModalHeaderProps>;
  Body: React.FC<ModalBodyProps>;
  Footer: React.FC<ModalFooterProps>;
} = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {children}
      </div>
    </div>
  );
};

Modal.Header = ({ children }) => (
  <div className="px-6 py-4 border-b border-gray-200">{children}</div>
);

Modal.Body = ({ children }) => <div className="px-6 py-4">{children}</div>;

Modal.Footer = ({ children }) => (
  <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-2">
    {children}
  </div>
);

// Uso
<Modal isOpen={isOpen} onClose={onClose}>
  <Modal.Header>
    <h2>Título del Modal</h2>
  </Modal.Header>
  <Modal.Body>
    <p>Contenido del modal</p>
  </Modal.Body>
  <Modal.Footer>
    <Button onClick={onClose}>Cerrar</Button>
  </Modal.Footer>
</Modal>;
```

### 2. **Render Props**

Para lógica reutilizable:

```tsx
interface DataFetcherProps<T> {
  url: string;
  children: (
    data: T | null,
    loading: boolean,
    error: string | null
  ) => React.ReactNode;
}

function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(url)
      .then((res) => res.json())
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [url]);

  return <>{children(data, loading, error)}</>;
}

// Uso
<DataFetcher<User[]> url="/api/users">
  {(users, loading, error) => {
    if (loading) return <div>Cargando...</div>;
    if (error) return <div>Error: {error}</div>;
    return <UserList users={users} />;
  }}
</DataFetcher>;
```

### 3. **Higher-Order Components (HOC)**

Para funcionalidad transversal:

```tsx
function withLoading<P extends object>(Component: React.ComponentType<P>) {
  return function WithLoadingComponent(props: P & { isLoading?: boolean }) {
    const { isLoading, ...restProps } = props;

    if (isLoading) {
      return <div className="animate-pulse">Cargando...</div>;
    }

    return <Component {...(restProps as P)} />;
  };
}

// Uso
const UserListWithLoading = withLoading(UserList);
```

## 🎯 Hooks Personalizados

### Estructura de Hooks

```tsx
// src/hooks/useLocalStorage.ts
import { useState, useEffect } from "react";

interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T) => void;
  removeValue: () => void;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): UseLocalStorageReturn<T> {
  // Estado para almacenar el valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Función para actualizar el valor
  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Función para remover el valor
  const removeValue = () => {
    try {
      setStoredValue(initialValue);
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  return { value: storedValue, setValue, removeValue };
}
```

### Hook para API Calls

```tsx
// src/hooks/useApi.ts
import { useState, useEffect } from "react";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  refetch: () => void;
}

export function useApi<T>(url: string): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, [url]);

  return { ...state, refetch: fetchData };
}
```

## 🎨 Estilos y CSS

### Uso de Tailwind CSS

```tsx
// Clases base
const baseClasses = "flex items-center justify-center";

// Clases condicionales
const conditionalClasses = cn(
  "px-4 py-2 rounded",
  isActive && "bg-blue-500 text-white",
  isDisabled && "opacity-50 cursor-not-allowed",
  size === "large" && "px-6 py-3 text-lg"
);

// Función de utilidad para combinar clases
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### CSS Modules (cuando sea necesario)

```tsx
// Button.module.css
.button {
  @apply inline-flex items-center justify-center font-medium rounded-lg;
  transition: all 0.2s ease-in-out;
}

.button:hover {
  transform: translateY(-1px);
}

// Button.tsx
import styles from './Button.module.css';

const Button = ({ className, ...props }) => (
  <button className={cn(styles.button, className)} {...props} />
);
```

## 🔧 Props y TypeScript

### Definición de Props

```tsx
// Props básicas
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

// Extender props HTML
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

// Props genéricas
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
}

// Props con discriminated unions
type ButtonProps =
  | {
      variant: "link";
      href: string;
      onClick?: never;
    }
  | {
      variant: "button";
      href?: never;
      onClick: () => void;
    };
```

### Ref Forwarding

```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "block w-full px-3 py-2 border border-gray-300 rounded-md",
            error && "border-red-500",
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
```

## 🧪 Testing de Componentes

### Testing con React Testing Library

```tsx
// Button.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  it("renders correctly", () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: "Click me" })
    ).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when loading", () => {
    render(<Button isLoading>Click me</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("applies custom className", () => {
    render(<Button className="custom-class">Click me</Button>);
    expect(screen.getByRole("button")).toHaveClass("custom-class");
  });
});
```

### Testing de Hooks

```tsx
// useLocalStorage.test.ts
import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "./useLocalStorage";

describe("useLocalStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns initial value when localStorage is empty", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));
    expect(result.current.value).toBe("initial");
  });

  it("updates localStorage when setValue is called", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

    act(() => {
      result.current.setValue("updated");
    });

    expect(result.current.value).toBe("updated");
    expect(localStorage.getItem("test-key")).toBe('"updated"');
  });
});
```

## 📚 Storybook

### Configuración de Stories

```tsx
// Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["primary", "secondary", "danger"],
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Button",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Button",
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
    children: "Loading...",
  },
};

export const WithIcons: Story = {
  args: {
    leftIcon: "🚀",
    rightIcon: "→",
    children: "With Icons",
  },
};
```

## 🚀 Optimización de Rendimiento

### Memoización

```tsx
// Memoizar componentes costosos
const ExpensiveComponent = React.memo(({ data, onUpdate }) => {
  // Renderizado costoso
  return <div>{/* ... */}</div>;
});

// Memoizar callbacks
const ParentComponent = () => {
  const [count, setCount] = useState(0);

  const handleUpdate = useCallback((newData) => {
    // Lógica de actualización
  }, []);

  return <ExpensiveComponent data={data} onUpdate={handleUpdate} />;
};
```

### Lazy Loading

```tsx
// Lazy loading de componentes
const LazyComponent = React.lazy(() => import("./LazyComponent"));

const App = () => (
  <Suspense fallback={<div>Cargando...</div>}>
    <LazyComponent />
  </Suspense>
);
```

## 📋 Checklist de Desarrollo

### Antes de crear un componente:

- [ ] ¿Es realmente necesario un nuevo componente?
- [ ] ¿Puede reutilizar un componente existente?
- [ ] ¿Dónde debe ubicarse en la estructura de carpetas?

### Durante el desarrollo:

- [ ] Definir interfaces TypeScript claras
- [ ] Implementar props con valores por defecto
- [ ] Manejar estados de carga y error
- [ ] Aplicar estilos consistentes con Tailwind
- [ ] Implementar accesibilidad (ARIA labels, keyboard navigation)

### Después del desarrollo:

- [ ] Escribir tests unitarios
- [ ] Crear stories de Storybook
- [ ] Documentar props y uso
- [ ] Revisar rendimiento
- [ ] Validar accesibilidad

## 🔗 Recursos Adicionales

- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Storybook Documentation](https://storybook.js.org/docs)

---

Esta guía proporciona las bases para desarrollar componentes consistentes y de alta calidad en FUSIONCOL Frontend.
