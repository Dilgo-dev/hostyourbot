package main

import (
	"log"
	"net"
	"os"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/hostyourbot/logs-service/internal/handlers"
	"github.com/hostyourbot/logs-service/internal/middleware"
	"github.com/hostyourbot/logs-service/internal/repository"
	"github.com/hostyourbot/logs-service/pkg/database"
	grpcService "github.com/hostyourbot/logs-service/internal/grpc"
	pb "github.com/hostyourbot/logs-service/pkg/proto"
	"google.golang.org/grpc"
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

	httpPort := os.Getenv("PORT")
	if httpPort == "" {
		httpPort = "3002"
	}

	grpcPort := os.Getenv("GRPC_PORT")
	if grpcPort == "" {
		grpcPort = "50052"
	}

	var wg sync.WaitGroup
	wg.Add(2)

	go func() {
		defer wg.Done()
		log.Printf("Starting HTTP server on port %s", httpPort)
		if err := r.Run(":" + httpPort); err != nil {
			log.Fatalf("HTTP server failed to start: %v", err)
		}
	}()

	go func() {
		defer wg.Done()
		lis, err := net.Listen("tcp", ":"+grpcPort)
		if err != nil {
			log.Fatalf("Failed to listen on gRPC port: %v", err)
		}

		grpcServer := grpc.NewServer()
		logsGrpcService := grpcService.NewLogsGrpcService(logRepo)
		pb.RegisterLogsServiceServer(grpcServer, logsGrpcService)

		log.Printf("Starting gRPC server on port %s", grpcPort)
		if err := grpcServer.Serve(lis); err != nil {
			log.Fatalf("gRPC server failed to start: %v", err)
		}
	}()

	wg.Wait()
}
