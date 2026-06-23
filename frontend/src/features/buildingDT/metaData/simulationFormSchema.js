const simulationFormSchema = {
  RUN_PERIOD_AND_TIMESTEP: {
    Begin_Date: {
      type: "date",
      display: "Begin Date",
      required: true,
      defaultValue: "2010-01-01",
      description: "Start date of the simulation run period.",
    },

    End_Date: {
      type: "date",
      display: "End Date",
      required: true,
      defaultValue: "2010-12-31",
      description: "End date of the simulation run period.",
    },

    Day_of_Week_for_Start_Day: {
      type: "select",
      display: "Day of Week for Start Day",
      required: false,
      defaultValue: "Friday",
      options: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      description:
        "Optional. If Begin Year is given and this is blank, EnergyPlus can determine the correct weekday.",
    },

    Number_of_Timesteps_per_Hour: {
      type: "select",
      display: "Number of Timesteps per Hour",
      required: true,
      defaultValue: 6,
      options: ["1", "2", "3", "4", "5", "6", "10", "12", "15", "20", "30", "60"],
      description:
        "Number of zone timesteps per hour. Must divide evenly into 60.",
    },
  },
};

export default simulationFormSchema;