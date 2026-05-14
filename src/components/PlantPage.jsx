import React, { useState, useEffect } from "react";
import NewPlantForm from "./NewPlantForm";
import PlantList from "./PlantList";
import Search from "./Search";

function PlantPage() {
  const [plants, setPlants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("/api/plants")
      .then((res) => res.json())
      .then((data) => setPlants(data));
  }, []);

  function handleAddPlant(newPlant) {
    setPlants([...plants, newPlant]);
  }

  function handleToggleStock(id) {
    const plant = plants.find((p) => p.id === id);
    if (!plant) return;

    fetch(`/api/plants/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inStock: !plant.inStock }),
    })
      .then((res) => res.json())
      .then((updatedPlant) => {
        const updatedPlants = plants.map((p) => {
          if (p.id === id) return updatedPlant;
          return p;
        });
        setPlants(updatedPlants);
      });
  }

  const displayedPlants = plants.filter((plant) => {
    return plant.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <main>
      <NewPlantForm onAddPlant={handleAddPlant} />
      <Search searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      <PlantList plants={displayedPlants} onToggleStock={handleToggleStock} />
    </main>
  );
}

export default PlantPage;
