package com.gymsaas;

import java.sql.Connection;

public class Main {
    public static void main(String[] args) {
        System.out.println("Conectando a la base de datos...");
        try (Connection conn = JdbcConnectionManager.getConnection()) {
            System.out.println("Conexion exitosa a PostgreSQL!");
            System.out.println("Base de datos: " + conn.getCatalog());
        } catch (Exception e) {
            System.out.println("Error de conexion: " + e.getMessage());
        }
    }
}