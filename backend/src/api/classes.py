class RKICounty:
    """ Class representing all rki entries for one county. """

    def __init__(self, county, timesteps):
        self.county = county
        self.data = timesteps
        self.count = len(timesteps)


class RKIDay:
    """ Class representing the rki entries for all counties on a single day. """

    def __init__(self, day, counties):
        self.day = day
        self.data = counties
        self.count = len(counties)