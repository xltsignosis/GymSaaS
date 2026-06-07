package com.gymsaas;

import java.io.InputStream;
import java.util.Properties;

public class DatabaseConfig {
    public static String URL;
    public static String USER;
    public static String PASSWORD;

    static {
        try (InputStream input = DatabaseConfig.class
                .getClassLoader()
                .getResourceAsStream("db.properties")) {
            Properties props = new Properties();
            props.load(input);
            URL      = props.getProperty("db.url");
            USER     = props.getProperty("db.user");
            PASSWORD = props.getProperty("db.password");
        } catch (Exception e) {
            throw new RuntimeException("No se pudo cargar db.properties", e);
        }
    }
}