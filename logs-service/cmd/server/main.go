package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/hostyourbot/logs-service/internal/handlers"
	"github.com/hostyourbot/logs-service/internal/middleware"
	"github.com/hostyourbot/logs-service/internal/repository"
	"github.com/hostyourbot/logs-service/pkg/database"
)

func main() {
	env := os.Getenv("ENVIRONMENT")
	if env == "" {
		env = "development"
	}

	dbPath := os.Getenv("DATABASE_PATH")
	if dbPath == "" {
		dbPath = "./data/logs.db"
	}

	config := database.Config{
		DatabasePath: dbPath,
		Environment:  env,
	}

	if err := database.Connect(config); err != nil {
		log.Fatalf("Database connection failed: %v", err)
	}

	logRepo := repository.NewLogRepository(database.GetDB())
	if err := logRepo.Migrate(); err != nil {
		log.Fatalf("Database migration failed: %v", err)
	}

	if env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()

	r.Use(middleware.CORS())

	api := r.Group("/api")
	{
		logs := api.Group("/logs")
		{
			logHandler := handlers.NewLogHandler(logRepo)
			logs.POST("", logHandler.CreateLog)
			logs.GET("", logHandler.GetLogs)
			logs.GET("/:id", logHandler.GetLog)
			logs.DELETE("/:id", logHandler.DeleteLog)
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "3002"
	}

	log.Printf("Starting server on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
