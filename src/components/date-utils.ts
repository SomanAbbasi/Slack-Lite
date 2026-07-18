export const format = (date: Date, pattern: string) => {
  if (pattern === "yyyy-MM-dd") {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  if (pattern === "EEEE, MMMM d") {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(date);
  }

  return date.toISOString();
};

export const differenceInMinutes = (later: Date, earlier: Date) => {
  return Math.abs(later.getTime() - earlier.getTime()) / (1000 * 60);
};

export const isToday = (date: Date) => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export const isYesterday = (date: Date) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
};
