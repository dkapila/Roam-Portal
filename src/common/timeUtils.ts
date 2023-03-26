export default {
  methods: {
    ordinalSuffixOf(number: number) {
      let mod10 = number % 10,
        mod100 = number % 100;
      if (mod10 == 1 && mod100 != 11) {
        return number + "st";
      }
      if (mod10 == 2 && mod100 != 12) {
        return number + "nd";
      }
      if (mod10 == 3 && mod100 != 13) {
        return number + "rd";
      }
      return number + "th";
    },
    getTodaysDateRoamFormat() {
      let month = new Date().toLocaleString("en-US", { month: "long" });
      let day = new Date().getDate();
      let year = new Date().getFullYear();

      let cardinal = this.ordinalSuffixOf(day);
      return month + " " + cardinal + ", " + year;
    },
    getNumberOfWeek(timestamp: number) {
      let weekDate = new Date(timestamp);

      let date = new Date(weekDate);
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
      let week1 = new Date(date.getFullYear(), 0, 4);
      return (
        1 +
        Math.round(
          ((date.getTime() - week1.getTime()) / 86400000 -
            3 +
            ((week1.getDay() + 6) % 7)) /
            7
        )
      );
    },
    getDateOfISOWeek(week: number, year: number) {
      let day = new Date(year, 0, 1 + (week - 1) * 7);
      let dayOfWeek = day.getDay();
      let ISOweekStart = day;
      if (dayOfWeek <= 4)
        ISOweekStart.setDate(day.getDate() - day.getDay() + 1);
      else ISOweekStart.setDate(day.getDate() + 8 - day.getDay());
      return ISOweekStart;
    },
    getDateRangeFromWeek(weakStr: string) {
      let year = weakStr.substring(0, 4);
      let weakNumber = weakStr.substr(weakStr.length - 2);

      let startDate = this.getDateOfISOWeek(parseInt(weakNumber, 10), parseInt(year));

      let endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);

      const startDateString = new Date(startDate)
        .toDateString()
        .split(" ")
        .slice(1)
        .join(" ");

      const endDateString = new Date(endDate).toDateString().split(" ").slice(1).join(" ");

      return {
        fromDate: startDateString,
        tillDate: endDateString,
      };
    },
    getFormattedDate(date: string) {
      return new Date(date)
        .toLocaleString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
        })
        .replace(",", "");
    },
    getRelativeTime(timestamp: number) {
      let current = new Date().getTime();

      let msPerMinute = 60 * 1000;
      let msPerHour = msPerMinute * 60;
      let msPerDay = msPerHour * 24;
      let msPerMonth = msPerDay * 30;
      let msPerYear = msPerDay * 365;

      let elapsed = current - timestamp;

      if (elapsed < msPerMinute) {
        return Math.round(elapsed / 1000) + " seconds ago";
      } else if (elapsed < msPerHour) {
        return Math.round(elapsed / msPerMinute) + " minutes ago";
      } else if (elapsed < msPerDay) {
        return Math.round(elapsed / msPerHour) + " hours ago";
      } else if (elapsed < msPerMonth) {
        return Math.round(elapsed / msPerDay) + " days ago";
      } else if (elapsed < msPerYear) {
        return Math.round(elapsed / msPerMonth) + " months ago";
      } else {
        return Math.round(elapsed / msPerYear) + " years ago";
      }
    },
  },
};
