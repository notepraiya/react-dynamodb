import logo from './logo.svg';
import './App.css';
import { useEffect } from "react";
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';

import AWS from "aws-sdk";
import { v4 as uuidv4  } from "uuid";

function App() {

  useEffect(() => {
    AWS.config.region = 'ap-southeast-1';
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'ap-southeast-1:19830473-d8f1-4b75-8c38-8f16db350c24',
    });
  }, []);

  const checkConfig = () => {
    AWS.config.apiVersions = {
      dynamodb: '2012-08-10',
      // other service API versions
    };

    AWS.config.getCredentials(function(err) {
      if (err) console.log(err.stack);
      else {
        console.log("Follow this => https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/getting-started-browser.html");
        console.log("Access key:", AWS.config.credentials.accessKeyId);
        console.log("Region: ", AWS.config.region);
      }
    });
  }

  const createTable = () => {
    var dynamodb = new AWS.DynamoDB();
    var params = {
      AttributeDefinitions: [
      { AttributeName: "Artist", AttributeType: "S" }, 
      { AttributeName: "SongTitle", AttributeType: "S" }
      ], 
      KeySchema: [
      { AttributeName: "Artist", KeyType: "HASH" }, 
      { AttributeName: "SongTitle", KeyType: "RANGE" }
      ], 
      ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }, 
      TableName: "Music"
    };
    
    dynamodb.createTable(params, function(err, data) {
      if (err) console.log(err, err.stack);
      else console.log(data);
    });
  }

  const putItem = () => {
    var dynamodb = new AWS.DynamoDB();

    fetch("https://randomuser.me/api/")
    .then(res => res.json())
    .then((data) => {
        console.log(data);

        var params = {
          Item: {
          "AlbumTitle": { S: data.results[0].location.city }, 
          "Artist": { S: data.results[0].name.first + " " + data.results[0].name.last }, 
          "SongTitle": { S: data.results[0].location.street.name }
          },
          ReturnConsumedCapacity: "TOTAL", 
          TableName: "Music"
        };
        
        dynamodb.putItem(params, function(err, data) {
          if (err) console.log(err, err.stack);
          else console.log(data);
        });

        console.log(`Album => ${uuidv4()}`);
      },
      (err) => {
        console.log(err, err.stack);
      }
    );

  }

  const deleteTable = () => {
    var dynamodb = new AWS.DynamoDB();

    var params = {
      TableName: "Music"
    };
    
    dynamodb.deleteTable(params, function(err, data) {
      if (err) console.log(err, err.stack);
      else console.log(data);
    });
  }

  return (
    // <div className="app">
      <Container fixed style={{ backgroundColor: '#282c34', textAlign: 'center', display: 'grid', justifyItems: 'center', } }>
        <img src={logo} className="app-logo" alt="logo" />
        <div className="app-button">
          <Button variant="contained" color="primary" onClick={ checkConfig }>
            Check Config
          </Button>
          <Button variant="contained" color="primary" onClick={ createTable }>
            Create Table
          </Button>
          <Button variant="contained" color="primary" onClick={ putItem }>
            Put an Item
          </Button>
          <Button variant="contained" color="primary" onClick={ deleteTable }>
            Delete Table
          </Button>
        </div>
      </Container>
    // </div>
  );
}

export default App;
