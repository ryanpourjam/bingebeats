"use client";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Card, Button, CloseButton } from "react-bootstrap";
import type { Show } from "../lib/types";

type ShowGridProps = {
  shows: Show[];
  dislike: (id: string | number) => void;
};

export default function ShowGrid({ shows, dislike }: ShowGridProps) {
  const { theme, systemTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;

  return (
    <div
      className="container-fluid px-0"
      style={{ maxHeight: "100vh", marginTop: "60px" }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, 250px)",
          justifyContent: "center",
          gap: "1rem",
        }}
      >
        {shows.map((show) => (
          <div key={show.id}>
            <Card style={{ width: "250px", maxHeight: "700px" }}>
              {show.imageUrl && (
                <Image
                  src={show.imageUrl}
                  alt={show.name}
                  width={250}
                  height={370}
                  className="card-img-top"
                  style={{ objectFit: "contain" }}
                />
              )}
              <Card.Body
                className="d-flex flex-column"
                style={{ flex: 1, minHeight: 0 }}
              >
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <Card.Title className="mb-0">{show.name}</Card.Title>
                  <CloseButton onClick={() => dislike(show.id)} />
                </div>
                {show.homepage && (
                  <Button
                    variant={currentTheme}
                    href={show.homepage}
                    target="_blank"
                  >
                    Homepage
                  </Button>
                )}
                <div className="flex-grow-1 overflow-auto">
                  <Card.Text className="mb-0" style={{ fontWeight: 350 }}>
                    {show.description}
                  </Card.Text>
                </div>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
