import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Clock, Plus, Trash2, Star, StarOff } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { mockTimezones, mockSavedTimezones } from "../data/mock";

const TimezoneConverter = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [customDate, setCustomDate] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [selectedTimezone, setSelectedTimezone] = useState("");
  const [convertedTime, setConvertedTime] = useState("");
  const [savedTimezones, setSavedTimezones] = useState(mockSavedTimezones);
  const [activeTimezones, setActiveTimezones] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Popular timezones for quick selection
  const popularTimezones = [
    { id: "America/New_York", name: "New York", offset: "-05:00" },
    { id: "Europe/London", name: "London", offset: "+00:00" },
    { id: "Asia/Tokyo", name: "Tokyo", offset: "+09:00" },
    { id: "Australia/Sydney", name: "Sydney", offset: "+11:00" },
    { id: "Europe/Paris", name: "Paris", offset: "+01:00" },
    { id: "Asia/Dubai", name: "Dubai", offset: "+04:00" },
  ];

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize active timezones with some popular ones
  useEffect(() => {
    setActiveTimezones([
      { id: "America/New_York", name: "New York", offset: "-05:00" },
      { id: "Europe/London", name: "London", offset: "+00:00" },
      { id: "Asia/Tokyo", name: "Tokyo", offset: "+09:00" },
    ]);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const convertToIST = (sourceTime, sourceTimezone) => {
    // Mock conversion logic - in real app, this would use proper timezone conversion
    const mockConversion = {
      time: "14:30:25",
      date: "Mon, Jan 15, 2024",
      offset: "+05:30"
    };
    return mockConversion;
  };

  const handleCurrentTimeConversion = (timezone) => {
    const result = convertToIST(currentTime, timezone);
    setConvertedTime(result);
    setSelectedTimezone(timezone);
    
    toast({
      title: "Conversion Complete",
      description: `Current time in ${timezone.name} converted to IST`
    });
  };

  const handleCustomTimeConversion = () => {
    if (!customDate || !customTime || !selectedTimezone) {
      toast({
        title: "Missing Information",
        description: "Please select date, time, and timezone",
        variant: "destructive"
      });
      return;
    }

    const result = convertToIST(new Date(`${customDate} ${customTime}`), selectedTimezone);
    setConvertedTime(result);
    
    toast({
      title: "Conversion Complete",
      description: `Custom time converted to IST`
    });
  };

  const toggleSavedTimezone = (timezone) => {
    const isAlreadySaved = savedTimezones.some(saved => saved.id === timezone.id);
    
    if (isAlreadySaved) {
      setSavedTimezones(savedTimezones.filter(saved => saved.id !== timezone.id));
      toast({
        title: "Removed from Favorites",
        description: `${timezone.name} removed from saved timezones`
      });
    } else {
      setSavedTimezones([...savedTimezones, timezone]);
      toast({
        title: "Added to Favorites",
        description: `${timezone.name} saved to favorites`
      });
    }
  };

  const addToActiveTimezones = (timezone) => {
    if (!activeTimezones.some(active => active.id === timezone.id)) {
      setActiveTimezones([...activeTimezones, timezone]);
    }
  };

  const removeFromActiveTimezones = (timezoneId) => {
    setActiveTimezones(activeTimezones.filter(tz => tz.id !== timezoneId));
  };

  const filteredTimezones = mockTimezones.filter(tz =>
    tz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tz.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white text-black p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Timezone Converter</h1>
          <p className="text-gray-600">One-click conversion to Indian Standard Time (IST)</p>
        </div>

        {/* Current Time Display */}
        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Current Time in IST
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div className="text-3xl font-mono font-bold">
                {formatTime(currentTime)}
              </div>
              <div className="text-lg text-gray-600">
                {formatDate(currentTime)}
              </div>
              <Badge variant="outline" className="font-mono">
                UTC +05:30
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Conversion Section */}
          <Card className="border-2 border-black">
            <CardHeader>
              <CardTitle>Quick Conversion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Popular Timezones</Label>
                <div className="grid grid-cols-2 gap-2">
                  {popularTimezones.map((timezone) => (
                    <Button
                      key={timezone.id}
                      variant="outline"
                      className="h-auto p-3 flex flex-col items-start border-black hover:bg-black hover:text-white transition-colors"
                      onClick={() => handleCurrentTimeConversion(timezone)}
                    >
                      <span className="font-semibold">{timezone.name}</span>
                      <span className="text-xs opacity-70">{timezone.offset}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <Separator className="bg-black" />

              <div>
                <Label className="text-sm font-medium mb-2 block">Search All Timezones</Label>
                <div className="space-y-2">
                  <Input
                    placeholder="Search timezones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-black focus:ring-black"
                  />
                  <Select value={selectedTimezone?.id || ""} onValueChange={(value) => {
                    const timezone = mockTimezones.find(tz => tz.id === value);
                    setSelectedTimezone(timezone);
                  }}>
                    <SelectTrigger className="border-black">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredTimezones.map((timezone) => (
                        <SelectItem key={timezone.id} value={timezone.id}>
                          {timezone.name} ({timezone.offset})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedTimezone && (
                  <Button
                    className="w-full mt-2 bg-black text-white hover:bg-gray-800"
                    onClick={() => handleCurrentTimeConversion(selectedTimezone)}
                  >
                    Convert Current Time
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Custom Time Conversion */}
          <Card className="border-2 border-black">
            <CardHeader>
              <CardTitle>Custom Time Conversion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="custom-date" className="text-sm font-medium">Date</Label>
                  <Input
                    id="custom-date"
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="border-black focus:ring-black"
                  />
                </div>
                <div>
                  <Label htmlFor="custom-time" className="text-sm font-medium">Time</Label>
                  <Input
                    id="custom-time"
                    type="time"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    className="border-black focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">From Timezone</Label>
                <Select value={selectedTimezone?.id || ""} onValueChange={(value) => {
                  const timezone = mockTimezones.find(tz => tz.id === value);
                  setSelectedTimezone(timezone);
                }}>
                  <SelectTrigger className="border-black">
                    <SelectValue placeholder="Select source timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTimezones.map((timezone) => (
                      <SelectItem key={timezone.id} value={timezone.id}>
                        {timezone.name} ({timezone.offset})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full bg-black text-white hover:bg-gray-800"
                onClick={handleCustomTimeConversion}
              >
                Convert Custom Time
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Conversion Result */}
        {convertedTime && (
          <Card className="border-2 border-black bg-gray-50">
            <CardHeader>
              <CardTitle>Conversion Result</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                <div className="text-2xl font-mono font-bold">
                  {convertedTime.time}
                </div>
                <div className="text-lg text-gray-600">
                  {convertedTime.date}
                </div>
                <Badge variant="outline" className="font-mono">
                  IST ({convertedTime.offset})
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Timezones Display */}
        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Active Timezones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeTimezones.map((timezone) => (
                <div key={timezone.id} className="border border-black p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{timezone.name}</h3>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleSavedTimezone(timezone)}
                        className="p-1"
                      >
                        {savedTimezones.some(saved => saved.id === timezone.id) ? (
                          <Star className="w-4 h-4 fill-current" />
                        ) : (
                          <StarOff className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFromActiveTimezones(timezone.id)}
                        className="p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-lg font-mono">
                    {formatTime(currentTime)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatDate(currentTime)}
                  </div>
                  <Badge variant="outline" className="text-xs mt-1">
                    {timezone.offset}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Saved Timezones */}
        {savedTimezones.length > 0 && (
          <Card className="border-2 border-black">
            <CardHeader>
              <CardTitle>Favorite Timezones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {savedTimezones.map((timezone) => (
                  <Button
                    key={timezone.id}
                    variant="outline"
                    className="border-black hover:bg-black hover:text-white"
                    onClick={() => addToActiveTimezones(timezone)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    {timezone.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TimezoneConverter;