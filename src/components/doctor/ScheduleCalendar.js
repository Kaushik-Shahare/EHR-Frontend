'use client';

import React, { useState, useEffect } from 'react';
import { getDoctorVisits } from '@/services/apiService';

export default function ScheduleCalendar({ isOpen, onClose, isFullPage = false }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateVisits, setSelectedDateVisits] = useState([]);

  // Fetch visits for the current month
    const fetchMonthVisits = async (year, month) => {
    try {
      setLoading(true);
      
      // Calculate date range for the month
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);
      
      const dateRange = `${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}`;
      
      const data = await getDoctorVisits({
        date_range: dateRange,
        status: 'all' // Get all statuses for calendar view
      });
      
      setVisits(data?.results || data || []);
    } catch (error) {
      console.error('Failed to fetch visits:', error);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch visits when month changes
  useEffect(() => {
    if (isOpen) {
      fetchMonthVisits(currentDate.getFullYear(), currentDate.getMonth());
    }
  }, [currentDate, isOpen]);

  // Get visits for a specific date
  const getVisitsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return visits.filter(visit => {
      if (!visit.check_in_time) return false;
      const visitDate = new Date(visit.check_in_time).toISOString().split('T')[0];
      return visitDate === dateStr;
    });
  };

  // Get the color class for a visit status
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-yellow-500';
    }
  };

  // Get the dominant status for a date (for the calendar dot)
  const getDominantStatus = (dayVisits) => {
    if (dayVisits.length === 0) return null;
    
    // Priority: in_progress > pending > completed > cancelled
    const statusPriority = {
      'in_progress': 4,
      'pending': 3,
      'completed': 2,
      'cancelled': 1
    };

    return dayVisits.reduce((dominant, visit) => {
      const currentPriority = statusPriority[visit.status?.toLowerCase()] || 0;
      const dominantPriority = statusPriority[dominant?.status?.toLowerCase()] || 0;
      return currentPriority > dominantPriority ? visit : dominant;
    }, dayVisits[0]);
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Handle date click
  const handleDateClick = (date) => {
    setSelectedDate(date);
    setSelectedDateVisits(getVisitsForDate(date));
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday
    
    const days = [];
    const currentDateObj = new Date(startDate);
    
    for (let i = 0; i < 42; i++) { // 6 weeks x 7 days
      const dayVisits = getVisitsForDate(currentDateObj);
      const dominantVisit = getDominantStatus(dayVisits);
      
      days.push({
        date: new Date(currentDateObj),
        isCurrentMonth: currentDateObj.getMonth() === month,
        isToday: currentDateObj.toDateString() === new Date().toDateString(),
        visits: dayVisits,
        dominantStatus: dominantVisit?.status
      });
      
      currentDateObj.setDate(currentDateObj.getDate() + 1);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (!isOpen) return null;

  const CalendarContent = () => (
    <div className={isFullPage ? "bg-white" : "bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"}>
      {/* Header */}
      <div className={`flex items-center justify-between p-6 ${isFullPage ? '' : 'border-b border-gray-200'}`}>
        <h2 className="text-2xl font-bold text-gray-900">
          {isFullPage ? 'My Schedule' : 'Schedule Calendar'}
        </h2>
        {!isFullPage && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        )}
      </div>

        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Calendar */}
            <div className="flex-1">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={goToPreviousMonth}
                    className="p-2 hover:bg-gray-100 rounded-md"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={goToToday}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md"
                  >
                    Today
                  </button>
                  <button
                    onClick={goToNextMonth}
                    className="p-2 hover:bg-gray-100 rounded-md"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Days of Week Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    onClick={() => handleDateClick(day.date)}
                    className={`
                      relative p-2 min-h-[40px] cursor-pointer hover:bg-gray-50 border rounded
                      ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                      ${day.isToday ? 'bg-blue-50 border-blue-200' : 'border-gray-200'}
                      ${selectedDate && day.date.toDateString() === selectedDate.toDateString() 
                        ? 'bg-blue-100 border-blue-300' : ''}
                    `}
                  >
                    <span className="text-sm">{day.date.getDate()}</span>
                    
                    {/* Visit indicators */}
                    {day.visits.length > 0 && (
                      <div className="absolute bottom-1 right-1 flex flex-wrap gap-1">
                        {day.dominantStatus && (
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(day.dominantStatus)}`}></div>
                        )}
                        {day.visits.length > 1 && (
                          <span className="text-xs text-gray-600">+{day.visits.length - 1}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Loading Indicator */}
              {loading && (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading visits...</span>
                </div>
              )}
            </div>

            {/* Side Panel */}
            <div className="lg:w-80">
              {/* Legend */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Status Legend</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <span>Pending</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span>In Progress</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span>Completed</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
                    <span>Cancelled</span>
                  </div>
                </div>
              </div>

              {/* Selected Date Details */}
              {selectedDate && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h4>
                  
                  {selectedDateVisits.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDateVisits.map((visit, index) => (
                        <div key={index} className="border-l-4 border-gray-200 pl-3 py-2">
                          <div className={`w-full border-l-4 pl-3 ${
                            visit.status === 'completed' ? 'border-green-500' :
                            visit.status === 'in_progress' ? 'border-blue-500' :
                            visit.status === 'pending' ? 'border-red-500' :
                            'border-gray-500'
                          }`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm">
                                {visit.patient_name || `Patient ${visit.patient?.id || 'N/A'}`}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                visit.status === 'completed' ? 'bg-green-100 text-green-800' :
                                visit.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                visit.status === 'pending' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {visit.status?.replace('_', ' ') || 'pending'}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {visit.check_in_time && 
                                new Date(visit.check_in_time).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true
                                })
                              }
                            </div>
                            <div className="text-xs text-gray-600 capitalize">
                              {visit.visit_type?.replace('_', ' ') || 'General consultation'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No appointments scheduled for this date.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
    </div>
  );

  // Return either modal wrapper or just content based on isFullPage
  if (isFullPage) {
    return <CalendarContent />;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <CalendarContent />
    </div>
  );
}