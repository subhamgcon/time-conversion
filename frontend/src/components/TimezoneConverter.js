import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Clock, Plus, Trash2, Star, StarOff, Loader2 } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { timezoneAPI } from "../services/api";

const TimezoneConverter = () => {
  const [currentISTTime, setCurrentISTTime] = useState(null);
  const [timezones, setTimezones] = useState([]);
  const [customDate, setCustomDate] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [selectedTimezone, setSelectedTimezone] = useState("");
  const [convertedTime, setConvertedTime] = useState(null);
  const [savedTimezones, setSavedTimezones] = useState([]);
  const [activeTimezones, setActiveTimezones] = useState([]);
  const [activeTimezoneTimes, setActiveTimezoneTimes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingTimezones, setLoadingTimezones] = useState(true);
  const { toast } = useToast();

  // Popular timezones for quick selection
  const popularTimezoneIds = [
    "America/New_York",
    "Europe/London", 
    "Asia/Tokyo",
    "Australia/Sydney",
    "Europe/Paris",
    "Asia/Dubai"
  ];

  // Load timezones on mount
  useEffect(() => {
    loadTimezones();
    loadSavedTimezones();
  }, []);

  // Update IST time every second
  useEffect(() => {
    const updateISTTime = async () => {
      try {
        const istTime = await timezoneAPI.getISTTime();
        setCurrentISTTime(istTime);
      } catch (error) {
        console.error("Error updating IST time:", error);
      }
    };

    updateISTTime();
    const timer = setInterval(updateISTTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update active timezone times every minute
  useEffect(() => {
    if (activeTimezones.length > 0) {
      updateActiveTimezoneTimes();
      const timer = setInterval(updateActiveTimezoneTimes, 60000); // Update every minute
      return () => clearInterval(timer);
    }
  }, [activeTimezones]);

  // Initialize with some popular timezones
  useEffect(() => {
    if (timezones.length > 0) {
      const popularTimezones = timezones.filter(tz => 
        ["America/New_York", "Europe/London", "Asia/Tokyo"].includes(tz.id)
      );
      setActiveTimezones(popularTimezones);
    }
  }, [timezones]);

  const loadTimezones = async () => {
    try {
      setLoadingTimezones(true);
      const data = await timezoneAPI.getTimezones();
      setTimezones(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load timezones",
        variant: "destructive"
      });
    } finally {
      setLoadingTimezones(false);
    }
  };

  const loadSavedTimezones = async () => {
    try {
      const data = await timezoneAPI.getSavedTimezones();
      setSavedTimezones(data);
    } catch (error) {
      console.error("Error loading saved timezones:", error);
    }
  };

  const updateActiveTimezoneTimes = async () => {
    if (activeTimezones.length === 0) return;
    
    try {
      const timezoneIds = activeTimezones.map(tz => tz.id);
      const times = await timezoneAPI.getTimezonesTimes(timezoneIds);
      setActiveTimezoneTimes(times);
    } catch (error) {
      console.error("Error updating active timezone times:", error);
    }
  };

  const handleCurrentTimeConversion = async (timezone) => {
    try {
      setLoading(true);
      const result = await timezoneAPI.convertToIST(timezone.id);
      setConvertedTime(result);
      setSelectedTimezone(timezone.id);
      
      toast({
        title: "Conversion Complete",
        description: `Current time in ${timezone.name} converted to IST`
      });
    } catch (error) {
      toast({
        title: "Conversion Error",
        description: "Failed to convert timezone",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCustomTimeConversion = async () => {
    if (!customDate || !customTime || !selectedTimezone) {
      toast({
        title: "Missing Information",
        description: "Please select date, time, and timezone",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const targetDatetime = `${customDate}T${customTime}:00`;
      const result = await timezoneAPI.convertToIST(selectedTimezone, targetDatetime);
      setConvertedTime(result);
      
      toast({
        title: "Conversion Complete",
        description: "Custom time converted to IST"
      });
    } catch (error) {
      toast({
        title: "Conversion Error",
        description: "Failed to convert custom time",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSavedTimezone = async (timezone) => {
    const isAlreadySaved = savedTimezones.some(saved => saved.timezone_id === timezone.id);
    
    try {
      if (isAlreadySaved) {
        await timezoneAPI.removeSavedTimezone(timezone.id);
        setSavedTimezones(savedTimezones.filter(saved => saved.timezone_id !== timezone.id));
        toast({
          title: "Removed from Favorites",
          description: `${timezone.name} removed from saved timezones`
        });
      } else {
        await timezoneAPI.addSavedTimezone(timezone.id, timezone.name);
        const newSaved = await timezoneAPI.getSavedTimezones();
        setSavedTimezones(newSaved);
        toast({
          title: "Added to Favorites",
          description: `${timezone.name} saved to favorites`
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update saved timezones",
        variant: "destructive"
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

  const getPopularTimezones = () => {
    return timezones.filter(tz => popularTimezoneIds.includes(tz.id));
  };

  const getFilteredTimezones = () => {
    return timezones.filter(tz =>
      tz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tz.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getActiveTimezoneTime = (timezoneId) => {
    return activeTimezoneTimes.find(time => time.timezone_id === timezoneId);
  };

  if (loadingTimezones) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading timezones...</span>
        </div>
      </div>
    );
  }

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
              {currentISTTime ? (
                <>
                  <div className="text-3xl font-mono font-bold">
                    {currentISTTime.time}
                  </div>
                  <div className="text-lg text-gray-600">
                    {currentISTTime.date}
                  </div>
                  <Badge variant="outline" className="font-mono">
                    {currentISTTime.offset}
                  </Badge>
                </>
              ) : (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              )}
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
                  {getPopularTimezones().map((timezone) => (
                    <Button
                      key={timezone.id}
                      variant="outline"
                      className="h-auto p-3 flex flex-col items-start border-black hover:bg-black hover:text-white transition-colors"
                      onClick={() => handleCurrentTimeConversion(timezone)}
                      disabled={loading}
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
                  <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
                    <SelectTrigger className="border-black">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {getFilteredTimezones().map((timezone) => (
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
                    onClick={() => {
                      const timezone = timezones.find(tz => tz.id === selectedTimezone);
                      if (timezone) handleCurrentTimeConversion(timezone);
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Converting...
                      </>
                    ) : (
                      "Convert Current Time"
                    )}
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
                <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
                  <SelectTrigger className="border-black">
                    <SelectValue placeholder="Select source timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((timezone) => (
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
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Converting...
                  </>
                ) : (
                  "Convert Custom Time"
                )}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">Source Time</h3>
                  <div className="text-2xl font-mono font-bold">
                    {convertedTime.source_time}
                  </div>
                  <div className="text-lg text-gray-600">
                    {convertedTime.source_date}
                  </div>
                  <Badge variant="outline" className="font-mono">
                    {convertedTime.source_timezone} ({convertedTime.source_offset})
                  </Badge>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">IST Time</h3>
                  <div className="text-2xl font-mono font-bold">
                    {convertedTime.ist_time}
                  </div>
                  <div className="text-lg text-gray-600">
                    {convertedTime.ist_date}
                  </div>
                  <Badge variant="outline" className="font-mono">
                    IST ({convertedTime.ist_offset})
                  </Badge>
                </div>
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
              {activeTimezones.map((timezone) => {
                const timeData = getActiveTimezoneTime(timezone.id);
                return (
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
                          {savedTimezones.some(saved => saved.timezone_id === timezone.id) ? (
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
                      {timeData ? timeData.time : "Loading..."}
                    </div>
                    <div className="text-sm text-gray-600">
                      {timeData ? timeData.date : ""}
                    </div>
                    <Badge variant="outline" className="text-xs mt-1">
                      {timezone.offset}
                    </Badge>
                  </div>
                );
              })}
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
                {savedTimezones.map((savedTz) => (
                  <Button
                    key={savedTz.id}
                    variant="outline"
                    className="border-black hover:bg-black hover:text-white"
                    onClick={() => {
                      const timezone = timezones.find(tz => tz.id === savedTz.timezone_id);
                      if (timezone) addToActiveTimezones(timezone);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    {savedTz.name}
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