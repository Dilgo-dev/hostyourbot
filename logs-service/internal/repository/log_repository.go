package repository

import (
	"encoding/json"

	"github.com/hostyourbot/logs-service/internal/models"
	"gorm.io/gorm"
)

type LogRepository struct {
	db *gorm.DB
}

func NewLogRepository(db *gorm.DB) *LogRepository {
	return &LogRepository{db: db}
}

func (r *LogRepository) Create(log *models.Log) error {
	return r.db.Create(log).Error
}

func (r *LogRepository) FindByID(id uint) (*models.Log, error) {
	var log models.Log
	err := r.db.First(&log, id).Error
	if err != nil {
		return nil, err
	}
	return &log, nil
}

type LogFilters struct {
	ServiceName string
	Level       string
	Limit       int
	Offset      int
}

func (r *LogRepository) FindAll(filters LogFilters) ([]models.Log, int64, error) {
	var logs []models.Log
	var total int64

	query := r.db.Model(&models.Log{})

	if filters.ServiceName != "" {
		query = query.Where("service_name = ?", filters.ServiceName)
	}

	if filters.Level != "" {
		query = query.Where("level = ?", filters.Level)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if filters.Limit == 0 {
		filters.Limit = 50
	}

	err := query.Order("created_at DESC").
		Limit(filters.Limit).
		Offset(filters.Offset).
		Find(&logs).Error

	if err != nil {
		return nil, 0, err
	}

	return logs, total, nil
}

func (r *LogRepository) Delete(id uint) error {
	return r.db.Delete(&models.Log{}, id).Error
}

func (r *LogRepository) Migrate() error {
	return r.db.AutoMigrate(&models.Log{})
}

func ToLogResponse(log *models.Log) models.LogResponse {
	var metadata map[string]interface{}
	if log.Metadata != nil {
		json.Unmarshal(log.Metadata, &metadata)
	}

	return models.LogResponse{
		ID:          log.ID,
		ServiceName: log.ServiceName,
		Level:       log.Level,
		Message:     log.Message,
		Metadata:    metadata,
		CreatedAt:   log.CreatedAt,
	}
}
