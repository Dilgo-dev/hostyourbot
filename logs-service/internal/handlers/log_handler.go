package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/hostyourbot/logs-service/internal/models"
	"github.com/hostyourbot/logs-service/internal/repository"
	"gorm.io/datatypes"
)

type LogHandler struct {
	repo *repository.LogRepository
}

func NewLogHandler(repo *repository.LogRepository) *LogHandler {
	return &LogHandler{repo: repo}
}

func (h *LogHandler) CreateLog(c *gin.Context) {
	var req models.CreateLogRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var metadata datatypes.JSON
	if req.Metadata != nil {
		metadataBytes, err := json.Marshal(req.Metadata)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid metadata format"})
			return
		}
		metadata = datatypes.JSON(metadataBytes)
	}

	log := &models.Log{
		ServiceName: req.ServiceName,
		Level:       req.Level,
		Message:     req.Message,
		Metadata:    metadata,
	}

	if err := h.repo.Create(log); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create log"})
		return
	}

	response := repository.ToLogResponse(log)
	c.JSON(http.StatusCreated, response)
}

func (h *LogHandler) GetLog(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid log ID"})
		return
	}

	log, err := h.repo.FindByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "log not found"})
		return
	}

	response := repository.ToLogResponse(log)
	c.JSON(http.StatusOK, response)
}

func (h *LogHandler) GetLogs(c *gin.Context) {
	serviceName := c.Query("service_name")
	level := c.Query("level")

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	filters := repository.LogFilters{
		ServiceName: serviceName,
		Level:       level,
		Limit:       limit,
		Offset:      offset,
	}

	logs, total, err := h.repo.FindAll(filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to retrieve logs"})
		return
	}

	responses := make([]models.LogResponse, len(logs))
	for i, log := range logs {
		responses[i] = repository.ToLogResponse(&log)
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   responses,
		"total":  total,
		"limit":  limit,
		"offset": offset,
	})
}

func (h *LogHandler) DeleteLog(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid log ID"})
		return
	}

	if err := h.repo.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete log"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "log deleted successfully"})
}
