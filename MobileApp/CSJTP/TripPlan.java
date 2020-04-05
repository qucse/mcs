import java.util.ArrayList;

public class TripPlan {
    private float date;
    private Point origin;
    private Point destination;
    private ArrayList<Itinerary> itineraries = new ArrayList<>();
}

public class Itinerary {
    private float duration;
    private float startTime;
    private float endTime;
    private float walkTime;
    private float transitTime;
    private float waitingTime;
    private float walkDistance;
    private boolean walkLimitExceeded;
    private float elevationLost;
    private float elevationGained;
    private float transfers;
    private ArrayList<Leg> legs = new ArrayList<>();

}

public class Leg {
    private float startTime;
    private float endTime;
    private float departureDelay;
    private float arrivalDelay;
    private boolean realTime;
    private float distance;
    private boolean pathway;
    private String mode;
    private String route;
    private String agencyName;
    private String agencyUrl;
    private float agencyTimeZoneOffset;
    private String routeColor;
    private float routeType;
    private String routeId;
    private String routeTextColor;
    private boolean interlineWithPreviousLeg;
    private String headsign;
    private String agencyId;
    private String tripId;
    private String serviceDate;
    private BusStop FromBusStop;
    private BusStop ToBusStop;
    private String routeShortName;
    private String routeLongName;
    private boolean rentedBike;
    private float flexDrtAdvanceBookMin;
    private float duration;
    private boolean transitLeg;
    private ArrayList<Step> steps = new ArrayList<>();
}

public class Step {
    private float distance;
    private String relativeDirection;
    private String streetName;
    private String absoluteDirection;
    private boolean stayOn;
    private boolean area;
    private boolean bogusName;
    private float lon;
    private float lat;
    private ArrayList<Object> elevation = new ArrayList<Object>();
}

public class BusStop {
    private String name;
    private String stopId;
    private float lon;
    private float lat;
    private float arrival;
    private float departure;
    private float stopIndex;
    private float stopSequence;
    private String vertexType;
    private String boardAlightType;
}

public class Point {
    private String name;
    private float lon;
    private float lat;
    private String orig;
    private String vertexType;
}