import React from "react";
import Octicon from "react-octicon";

import Button from "components/button";

import { PERSISTANCE_FILTER } from "store-constants";
import { buttonColor, darkGrey } from "theme/variables";

function getJSONHash(obj) {
    // 1. Serialize the object while sorting keys alphabetically
    const orderedString = JSON.stringify(obj, (key, value) => {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            return Object.keys(value).sort().reduce((sorted, k) => {
                sorted[k] = value[k];
                return sorted;
            }, {});
        }
        return value;
    });

    // 2. Apply the simple DJB2 hash to the sorted string
    let hash = 5381;
    for (let i = 0; i < orderedString.length; i++) {
        hash = (hash * 33) ^ orderedString.charCodeAt(i);
    }
    return hash >>> 0;
}


function validateState(state) {
  let output = true;

  for (let stateProperty in state) {
    if (state.hasOwnProperty(stateProperty)) {
      if (!PERSISTANCE_FILTER.includes(stateProperty)) output = false;
    }
  }
  return output;
}

const styles = {
  button: {
    borderRadius: 4,
    backgroundColor: buttonColor,
    marginLeft: 5,
    marginRight: 5
  },
  icon: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: darkGrey,
    transform: "scale(0.8)"
  },
  input: {
    display: "none"
  }
};

const LoadButton = props => {
  const { playing, onLoadedState, size = 50 } = props;

  const fileUploadRef = React.useRef(null);

  const handlePress = React.useCallback(() => {
    const fileUpload = fileUploadRef.current;
    if (fileUpload != null) {
      fileUpload.click();
    }
  }, []);

  const handleFileChange = React.useCallback(() => {
    const fileUpload = fileUploadRef.current;
    if (fileUpload != null) {
      const files = fileUpload.files;
      if (files.length === 1) {
        const file = files[0];
        const reader = new FileReader();

        reader.onload = () => {
          let loadedState = JSON.parse(reader.result);
          const hash = getJSONHash(loadedState);
          console.log("Loaded state hash:", hash);
          if (validateState(loadedState)) {
            onLoadedState(loadedState);
          } else {
            window.alert("Sorry, the given io808 save is invalid.");
          }
        };

        reader.readAsText(file);
      } else {
        window.alert("Sorry, please only upload one io808 save at a time.");
      }
    } else {
      window.alert(
        "Sorry, an unknown error occured while uploading your save."
      );
    }
  }, [onLoadedState]);

  return (
    <Button
      style={{ ...styles.button, width: size, height: size }}
      disabled={playing}
      onClick={handlePress}
    >
      <input
        ref={fileUploadRef}
        type="file"
        style={styles.input}
        onChange={handleFileChange}
      />
      <Octicon
        title="Load"
        style={{ ...styles.icon, width: size, height: size }}
        name="cloud-upload"
        mega={true}
      />
    </Button>
  );
};

export default LoadButton;
