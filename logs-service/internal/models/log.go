package models

import (
	"time"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type LogLevel string

const (
	LogLevelInfo  LogLevel = "info"
	LogLevelWarn  LogLevel = "warn"
	LogLevelError LogLevel = "error"
	LogLevelDebug LogLevel = "debug"
)

type Log struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	ServiceName string         `gorm:"index;not null" json:"service_name"`
	Level       LogLevel       `gorm:"index;not null" json:"level"`
	Message     string         `gorm:"not null" json:"message"`
	Metadata    datatypes.JSON `json:"metadata"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

type CreateLogRequest struct {
	ServiceName string                 `json:"service_name" binding:"required"`
	Level       LogLevel               `json:"level" binding:"required,oneof=info warn error debug"`
	Message     string                 `json:"message" binding:"required"`
	Metadata    map[string]interface{} `json:"metadata"`
}

type LogResponse struct {
	ID          uint                   `json:"id"`
	ServiceName string                 `json:"service_name"`
	Level       LogLevel               `json:"level"`
	Message     string                 `json:"message"`
	Metadata    map[string]interface{} `json:"metadata"`
	CreatedAt   time.Time              `json:"created_at"`
}
