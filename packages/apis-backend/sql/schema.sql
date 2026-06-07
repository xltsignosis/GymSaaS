-- Tabla de usuarios (admins, entrenadores, clientes)
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(150),
    role VARCHAR(50) NOT NULL,
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Planes de membresía
CREATE TABLE membership_plans (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    duration_days INT NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Suscripciones de usuarios a planes
CREATE TABLE subscriptions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    membership_plan_id BIGINT NOT NULL REFERENCES membership_plans(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Clases del gimnasio
CREATE TABLE gym_classes (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    trainer_id BIGINT REFERENCES users(id),
    capacity INT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Reservas de clases
CREATE TABLE class_bookings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    gym_class_id BIGINT NOT NULL REFERENCES gym_classes(id),
    booked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    status VARCHAR(50) DEFAULT 'booked'
);

-- Pagos
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    subscription_id BIGINT REFERENCES subscriptions(id),
    amount NUMERIC(10,2) NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    payment_method VARCHAR(100),
    status VARCHAR(50) NOT NULL
);