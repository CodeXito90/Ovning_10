import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './StarWarsSearch.css';

const StarWarsSearch = () => {
  const [characterName, setCharacterName] = useState('');
  const [characterData, setCharacterData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getApi = async () => {
    setLoading(true);
    setError(null);
    try {
      const fullUri = `https://www.swapi.tech/api/people/?name=${encodeURIComponent(characterName)}`;
      const response = await fetch(fullUri);
      const data = await response.json();
      
      if (data.result && data.result.length > 0) {
        const character = data.result[0].properties;
        setCharacterData({
          name: character.name,
          height: character.height,
          mass: character.mass,
          gender: character.gender,
          hairColor: character.hair_color
        });
      } else {
        setError('Character not found');
      }
    } catch (err) {
      setError('An error occurred while fetching data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (    
    <Container fluid className="star-wars-bg">
      <Card className="search-card">
        <Card.Body>
          <h1>Star Wars Biometrics</h1>     
          <Form onSubmit={(e) => { e.preventDefault(); getApi(); }}>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                placeholder="Enter character name"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100 mb-3">
              Search Galaxy
            </Button>
          </Form>
          {loading && (
            <div className="loading-animation">
              <div className="loading-bar"></div>
            </div>
          )}
          {error && <div className="error-message">{error}</div>}
          {characterData && (
            <Card className="character-card">
              <Card.Body>
                <h2>{characterData.name}</h2>
                <div className="character-info">
                  <div className="character-info-item">
                    <strong>Height</strong>
                    <span>{characterData.height} cm</span>
                  </div>
                  <div className="character-info-item">
                    <strong>Mass</strong>
                    <span>{characterData.mass} kg</span>
                  </div>
                  <div className="character-info-item">
                    <strong>Gender</strong>
                    <span>{characterData.gender}</span>
                  </div>
                  <div className="character-info-item">
                    <strong>Hair Color</strong>
                    <span>{characterData.hairColor}</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default StarWarsSearch;