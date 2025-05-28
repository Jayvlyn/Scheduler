import React, { useState } from 'react';
import { 
  Box, 
  Slider, 
  Typography, 
  Paper, 
  Button, 
  TextField, 
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Alert,
  Snackbar,
  Grid
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Settings as SettingsIcon } from '@mui/icons-material';

interface TimeBlock {
  start: number;
  end: number;
  category: string;
  color: string;
}

interface TimeRange {
  start: number;
  end: number;
}

const TimeAllocationSlider: React.FC = () => {
  // Test comment 1: This component manages daily time allocation
  // Test comment 2: It allows users to create and modify time blocks
  // Test comment 3: Each block represents a different activity or category
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([
    { start: 0, end: 4, category: 'Sleep', color: '#2196f3' },
    { start: 4, end: 8, category: 'Work', color: '#4caf50' },
    { start: 8, end: 12, category: 'Exercise', color: '#ff9800' },
    { start: 12, end: 16, category: 'Leisure', color: '#9c27b0' },
    { start: 16, end: 24, category: 'Family Time', color: '#f44336' },
  ]);

  const [timeRange, setTimeRange] = useState<TimeRange>({ start: 0, end: 24 });
  const [tempTimeRange, setTempTimeRange] = useState<TimeRange>({ start: 0, end: 24 });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', color: '#000000' });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);

  const formatTime = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = Math.floor(hour % 12) || 12;
    const minutes = Math.round((hour % 1) * 60);
    const formattedMinutes = minutes.toString().padStart(2, '0');
    return `${displayHour}:${formattedMinutes} ${period}`;
  };

  const handleTimeRangeChange = (newRange: TimeRange) => {
    // Validate the new range
    if (newRange.end <= newRange.start) {
      setErrorMessage('End time must be greater than start time');
      return;
    }

    if (newRange.end - newRange.start < 1) {
      setErrorMessage('Time range must be at least 1 hour');
      return;
    }

    // Adjust time blocks to fit within the new range
    const newTimeBlocks = timeBlocks.map(block => {
      const blockDuration = block.end - block.start;
      const newStart = Math.max(newRange.start, block.start);
      const newEnd = Math.min(newRange.end, block.end);
      
      // If block is completely outside new range, adjust it to start at the beginning
      if (newStart >= newRange.end || newEnd <= newRange.start) {
        return {
          ...block,
          start: newRange.start,
          end: Math.min(newRange.start + blockDuration, newRange.end)
        };
      }

      return {
        ...block,
        start: newStart,
        end: newEnd
      };
    });

    setTimeBlocks(newTimeBlocks);
    setTimeRange(newRange);
    setIsSettingsDialogOpen(false);
  };

  const handleOpenSettings = () => {
    setTempTimeRange(timeRange);
    setIsSettingsDialogOpen(true);
  };

  const handleAcceptTimeRange = () => {
    handleTimeRangeChange(tempTimeRange);
  };

  const handleBlockChange = (index: number, newValue: number[]) => {
    const [newStart, newEnd] = newValue;
    const newTimeBlocks = [...timeBlocks];
    
    // Ensure minimum block duration of 30 minutes
    if (newEnd - newStart < 0.5) {
      setErrorMessage('Time blocks must be at least 30 minutes long');
      return;
    }

    // Get adjacent blocks
    const prevBlock = index > 0 ? newTimeBlocks[index - 1] : null;
    const nextBlock = index < newTimeBlocks.length - 1 ? newTimeBlocks[index + 1] : null;

    // Calculate the total change in time
    const startDiff = newStart - timeBlocks[index].start;
    const endDiff = newEnd - timeBlocks[index].end;

    // Update the current block
    newTimeBlocks[index] = {
      ...newTimeBlocks[index],
      start: newStart,
      end: newEnd,
    };

    // Adjust previous block if moving start time
    if (prevBlock && startDiff !== 0) {
      newTimeBlocks[index - 1] = {
        ...prevBlock,
        end: newStart,
      };
    }

    // Adjust next block if moving end time
    if (nextBlock && endDiff !== 0) {
      newTimeBlocks[index + 1] = {
        ...nextBlock,
        start: newEnd,
      };
    }

    // Ensure blocks don't go beyond time range
    if (newTimeBlocks[index].end > timeRange.end) {
      newTimeBlocks[index] = {
        ...newTimeBlocks[index],
        end: timeRange.end,
      };
      if (nextBlock) {
        newTimeBlocks[index + 1] = {
          ...nextBlock,
          start: timeRange.end,
        };
      }
    }

    // Ensure blocks don't start before time range
    if (newTimeBlocks[index].start < timeRange.start) {
      newTimeBlocks[index] = {
        ...newTimeBlocks[index],
        start: timeRange.start,
      };
      if (prevBlock) {
        newTimeBlocks[index - 1] = {
          ...prevBlock,
          end: timeRange.start,
        };
      }
    }

    // Ensure minimum block duration for adjacent blocks
    if (prevBlock && newTimeBlocks[index - 1].end - newTimeBlocks[index - 1].start < 0.5) {
      setErrorMessage('Time blocks must be at least 30 minutes long');
      return;
    }
    if (nextBlock && newTimeBlocks[index + 1].end - newTimeBlocks[index + 1].start < 0.5) {
      setErrorMessage('Time blocks must be at least 30 minutes long');
      return;
    }

    setTimeBlocks(newTimeBlocks);
  };

  const handleAddCategory = () => {
    if (newCategory.name.trim()) {
      const lastBlock = timeBlocks[timeBlocks.length - 1];
      const newBlock: TimeBlock = {
        start: lastBlock.end,
        end: timeRange.end,
        category: newCategory.name.trim(),
        color: newCategory.color,
      };
      setTimeBlocks([...timeBlocks, newBlock]);
      setNewCategory({ name: '', color: '#000000' });
      setIsAddDialogOpen(false);
    }
  };

  const handleRemoveCategory = (index: number) => {
    const newTimeBlocks = timeBlocks.filter((_, i) => i !== index);
    // Adjust the end time of the previous block to fill the gap
    if (index > 0 && index < timeBlocks.length) {
      newTimeBlocks[index - 1] = {
        ...newTimeBlocks[index - 1],
        end: timeBlocks[index].end,
      };
    }
    setTimeBlocks(newTimeBlocks);
    setSelectedBlock(null);
  };

  // Calculate time markers based on the time range
  const timeMarkers = [];
  const range = timeRange.end - timeRange.start;
  const interval = Math.ceil(range / 4); // Show 4 markers
  for (let i = timeRange.start; i <= timeRange.end; i += interval) {
    timeMarkers.push(i);
  }
  if (!timeMarkers.includes(timeRange.end)) {
    timeMarkers.push(timeRange.end);
  }

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        maxWidth: 1200, 
        mx: 'auto', 
        mt: 'auto',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        borderRadius: '16px 16px 0 0',
        backgroundColor: 'rgba(30, 30, 30, 0.95)',
        backdropFilter: 'blur(10px)',
        color: 'white',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ color: 'white' }}>
          Daily Time Allocation
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={handleOpenSettings}
            sx={{ 
              color: 'white',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            Settings
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsAddDialogOpen(true)}
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0',
              }
            }}
          >
            Add Category
          </Button>
        </Box>
      </Box>

      <Box sx={{ position: 'relative', mb: 4 }}>
        {/* Time markers */}
        <Box sx={{ position: 'relative', height: 24, mb: 1 }}>
          {timeMarkers.map((time, index) => (
            <Box
              key={index}
              sx={{
                position: 'absolute',
                left: `${((time - timeRange.start) / (timeRange.end - timeRange.start)) * 100}%`,
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '1px',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  mb: 0.5,
                }}
              >
                {formatTime(time)}
              </Typography>
              <Box
                sx={{
                  width: '1px',
                  height: 12,
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                }}
              />
            </Box>
          ))}
        </Box>

        {/* Time blocks */}
        <Box sx={{ position: 'relative', height: 40 }}>
          {timeBlocks.map((block, index) => (
            <Box
              key={index}
              sx={{
                position: 'absolute',
                left: `${((block.start - timeRange.start) / (timeRange.end - timeRange.start)) * 100}%`,
                width: `${((block.end - block.start) / (timeRange.end - timeRange.start)) * 100}%`,
                height: 40,
                backgroundColor: block.color,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                '&:hover': {
                  filter: 'brightness(1.1)',
                },
              }}
              onClick={() => setSelectedBlock(index)}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'white',
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  px: 1,
                }}
              >
                {block.category}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Selected block controls */}
      {selectedBlock !== null && (
        <Box
          sx={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(30, 30, 30, 0.95)',
            p: 2,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            mb: 2,
            minWidth: 300,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ color: 'white' }}>
              {timeBlocks[selectedBlock].category}
            </Typography>
            <IconButton
              size="small"
              onClick={() => handleRemoveCategory(selectedBlock)}
              sx={{ color: 'white' }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
          <Slider
            value={[timeBlocks[selectedBlock].start, timeBlocks[selectedBlock].end]}
            onChange={(_, newValue) => handleBlockChange(selectedBlock, newValue as number[])}
            min={timeRange.start}
            max={timeRange.end}
            step={0.5}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => formatTime(value)}
            sx={{
              color: timeBlocks[selectedBlock].color,
              '& .MuiSlider-thumb': {
                backgroundColor: timeBlocks[selectedBlock].color,
              },
              '& .MuiSlider-track': {
                backgroundColor: timeBlocks[selectedBlock].color,
              },
              '& .MuiSlider-rail': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              },
            }}
          />
        </Box>
      )}

      {/* Add Category Dialog */}
      <Dialog 
        open={isAddDialogOpen} 
        onClose={() => setIsAddDialogOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: '#1e1e1e',
            color: 'white',
          }
        }}
      >
        <DialogTitle sx={{ color: 'white' }}>Add New Category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            fullWidth
            variant="outlined"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1976d2',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
            }}
          />
          <TextField
            margin="dense"
            label="Color"
            type="color"
            fullWidth
            variant="outlined"
            value={newCategory.color}
            onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1976d2',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setIsAddDialogOpen(false)}
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddCategory}
            variant="contained"
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0',
              }
            }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog 
        open={isSettingsDialogOpen} 
        onClose={() => setIsSettingsDialogOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: '#1e1e1e',
            color: 'white',
          }
        }}
      >
        <DialogTitle sx={{ color: 'white' }}>Time Range Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography sx={{ color: 'white', mb: 1 }}>Start Time</Typography>
            <TextField
              type="number"
              value={tempTimeRange.start}
              onChange={(e) => setTempTimeRange({ ...tempTimeRange, start: Number(e.target.value) })}
              inputProps={{ min: 0, max: 23, step: 1 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1976d2',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
              }}
            />
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography sx={{ color: 'white', mb: 1 }}>End Time</Typography>
            <TextField
              type="number"
              value={tempTimeRange.end}
              onChange={(e) => setTempTimeRange({ ...tempTimeRange, end: Number(e.target.value) })}
              inputProps={{ min: 1, max: 24, step: 1 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1976d2',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setIsSettingsDialogOpen(false)}
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAcceptTimeRange}
            variant="contained"
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0',
              }
            }}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage(null)}
      >
        <Alert 
          onClose={() => setErrorMessage(null)} 
          severity="error"
          sx={{ 
            width: '100%',
            backgroundColor: '#d32f2f',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white',
            },
          }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default TimeAllocationSlider; 