export function getIssueMarkerData(
  issue = {}
) {

  const priority =
    String(
      issue.priority || "medium"
    ).toLowerCase();

  let label = "●";

  if (priority === "critical") {
    label = "!";
  } else if (priority === "high") {
    label = "H";
  } else if (priority === "low") {
    label = "L";
  }

  return {
    label,
    title:
      issue.title ||
      "Civic Issue",
    category:
      issue.category ||
      "Other",
    priority,
    status:
      issue.status ||
      "open",
    latitude:
      issue.latitude,
    longitude:
      issue.longitude
  };
}

export function filterMapIssues(
  issues = [],
  options = {}
) {

  return issues.filter(
    issue => {

      if (
        options.category &&
        issue.category !==
          options.category
      ) {
        return false;
      }

      if (
        options.status &&
        issue.status !==
          options.status
      ) {
        return false;
      }

      return (
        Number.isFinite(
          Number(issue.latitude)
        ) &&
        Number.isFinite(
          Number(issue.longitude)
        )
      );
    }
  );
}
