package database

import (
	"fmt"
	"log"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

type Config struct {
	DatabasePath string
	Environment  string
}

func Connect(config Config) error {
	var err error
	var logLevel logger.LogLevel

	if config.Environment == "production" {
		logLevel = logger.Silent
	} else {
		logLevel = logger.Info
	}

	DB, err = gorm.Open(sqlite.Open(config.DatabasePath), &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
	})

	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Println("Database connection established")
	return nil
}

func GetDB() *gorm.DB {
	return DB
}
