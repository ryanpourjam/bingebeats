import csv
import json


def main():

    filtered_shows = []

    with open("TMDB_tv_dataset_v3.csv", mode="r", encoding="utf-8") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            try:
                popularity = float(row["popularity"])
                languages = [lang.strip() for lang in row["languages"].split(",")]
            except (ValueError, KeyError):
                continue

            if popularity >= 50 and "en" in languages:
                filtered_shows.append(row)

    with open("filtered_shows.json", "w", encoding="utf-8") as jsonfile:
        json.dump(filtered_shows, jsonfile, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
