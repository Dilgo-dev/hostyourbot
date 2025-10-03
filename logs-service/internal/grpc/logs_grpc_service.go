package grpc

import (
	"context"
	"encoding/json"
	"time"

	pb "github.com/hostyourbot/logs-service/pkg/proto"
	"github.com/hostyourbot/logs-service/internal/models"
	"github.com/hostyourbot/logs-service/internal/repository"
	"gorm.io/datatypes"
)

type LogsGrpcService struct {
	pb.UnimplementedLogsServiceServer
	repo *repository.LogRepository
}

func NewLogsGrpcService(repo *repository.LogRepository) *LogsGrpcService {
	return &LogsGrpcService{repo: repo}
}

func (s *LogsGrpcService) CreateLog(ctx context.Context, req *pb.CreateLogRequest) (*pb.CreateLogResponse, error) {
	var metadata datatypes.JSON
	if req.Metadata != nil && len(req.Metadata) > 0 {
		metadataMap := make(map[string]interface{})
		for k, v := range req.Metadata {
			metadataMap[k] = v
		}
		metadataBytes, err := json.Marshal(metadataMap)
		if err != nil {
			return nil, err
		}
		metadata = datatypes.JSON(metadataBytes)
	}

	log := &models.Log{
		ServiceName: req.ServiceName,
		Level:       models.LogLevel(req.Level),
		Message:     req.Message,
		Metadata:    metadata,
	}

	if err := s.repo.Create(log); err != nil {
		return nil, err
	}

	response := repository.ToLogResponse(log)

	metadataResponse := make(map[string]string)
	if response.Metadata != nil {
		for k, v := range response.Metadata {
			if str, ok := v.(string); ok {
				metadataResponse[k] = str
			}
		}
	}

	return &pb.CreateLogResponse{
		Id:          uint32(response.ID),
		ServiceName: response.ServiceName,
		Level:       string(response.Level),
		Message:     response.Message,
		Metadata:    metadataResponse,
		CreatedAt:   response.CreatedAt.Format(time.RFC3339),
	}, nil
}

func (s *LogsGrpcService) GetLogs(ctx context.Context, req *pb.GetLogsRequest) (*pb.GetLogsResponse, error) {
	filters := repository.LogFilters{
		ServiceName: req.ServiceName,
		Level:       req.Level,
		Limit:       int(req.Limit),
		Offset:      int(req.Offset),
	}

	logs, total, err := s.repo.FindAll(filters)
	if err != nil {
		return nil, err
	}

	var pbLogs []*pb.LogResponse
	for _, log := range logs {
		response := repository.ToLogResponse(&log)

		metadataResponse := make(map[string]string)
		if response.Metadata != nil {
			for k, v := range response.Metadata {
				if str, ok := v.(string); ok {
					metadataResponse[k] = str
				}
			}
		}

		pbLogs = append(pbLogs, &pb.LogResponse{
			Id:          uint32(response.ID),
			ServiceName: response.ServiceName,
			Level:       string(response.Level),
			Message:     response.Message,
			Metadata:    metadataResponse,
			CreatedAt:   response.CreatedAt.Format(time.RFC3339),
		})
	}

	return &pb.GetLogsResponse{
		Logs:  pbLogs,
		Total: total,
	}, nil
}

func (s *LogsGrpcService) GetLog(ctx context.Context, req *pb.GetLogRequest) (*pb.LogResponse, error) {
	log, err := s.repo.FindByID(uint(req.Id))
	if err != nil {
		return nil, err
	}

	response := repository.ToLogResponse(log)

	metadataResponse := make(map[string]string)
	if response.Metadata != nil {
		for k, v := range response.Metadata {
			if str, ok := v.(string); ok {
				metadataResponse[k] = str
			}
		}
	}

	return &pb.LogResponse{
		Id:          uint32(response.ID),
		ServiceName: response.ServiceName,
		Level:       string(response.Level),
		Message:     response.Message,
		Metadata:    metadataResponse,
		CreatedAt:   response.CreatedAt.Format(time.RFC3339),
	}, nil
}

func (s *LogsGrpcService) DeleteLog(ctx context.Context, req *pb.DeleteLogRequest) (*pb.DeleteLogResponse, error) {
	if err := s.repo.Delete(uint(req.Id)); err != nil {
		return nil, err
	}

	return &pb.DeleteLogResponse{
		Message: "log deleted successfully",
	}, nil
}
