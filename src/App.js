import './App.css';
import React, { useEffect, useState } from 'react';
import bbcodeParser from "./BBCodeEmulator";
import { Form, Button } from 'semantic-ui-react'
import { Divider, Container } from 'semantic-ui-react'
import { DEFAULT } from "./items.default";
function App() {
  const [localizationItems, setLocalizationItems] = useState(DEFAULT);

  const uploadRef = React.createRef()
  function readJSON(e) {
    var reader = new FileReader();
    reader.onload = onReaderLoad;
    if (e.target.files[0]) {
      reader.readAsText(e.target.files[0]);
    }
  }

  function onReaderLoad(event) {
    console.log(event.target.result);
    try {
      var obj = JSON.parse(event.target.result);
      setLocalizationItems(obj)
    } catch (error) {
      alert("Hey, this file is not a valid localization file (a JSON file)")
    }
  }

  function addNewKeyVar() {
    const _items = [...localizationItems]
    const blank = [`Random_string_${new Date().getMilliseconds()}`, ""]
    _items.push(blank)
    setLocalizationItems(_items)
  }

  function deleteLocItem(idx) {
    const _items = [...localizationItems]
    _items.splice(idx, 1)
    setLocalizationItems(_items)
  }

  function updateItem(payload, idx) {
    const _items = [...localizationItems]
    if (payload.textKey ?? false) {
      _items[idx] = [payload.textKey, _items[idx][1]]
    } else if (payload.text ?? false) {
      _items[idx] = [_items[idx][0], payload.text]
    }
    setLocalizationItems(_items)
  }

  function downloadJSON() {
    const objects = localizationItems.reduce((acc, item) => {
      acc[item[0]] = item[1]
      return acc
    }, {})
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(objects, null, 2));
    var dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "locale.json");
    document.body.appendChild(dlAnchorElem); // Please firefox don't break, thanks
    dlAnchorElem.click();
    setTimeout(() => {
      document.body.removeChild(dlAnchorElem)
    }, 10);
  }

  return (
    <div className="App">
      <header>
        <Container>
          <div className="toolbar">
            <Button>New Project</Button>
            <Button onClick={() => uploadRef.current?.click()}>Load from file</Button>
            <Button onClick={() => downloadJSON()}>Save to file</Button>
            <div className="spacer"></div>
            <Button onClick={() => addNewKeyVar()}>Add new Line</Button>
            <input ref={uploadRef} hidden label="Load file" onChange={readJSON} id="file" type="file" />
          </div>
        </Container>
      </header>

      <div className="lists">
        {localizationItems.map((item, i) => (
          <Editor key={i + item[0]} textKey={item[0]} text={item[1]} onUpdated={e => updateItem(e, i)} onDeleted={() => deleteLocItem(i)}></Editor>
        ))}
      </div>
    </div>
  );
}

function Editor({ textKey, text, onUpdated, onDeleted }) {
  const [itemKey, setItemKey] = useState("");
  const [textValue, setTextValue] = useState("");
  const [rendered, setRendered] = useState("");
  const [taRows, setTaRows] = useState(5);

  const emptyError = (txt) => {
    return {
      content: txt || 'Hey, this is empty',
      pointing: 'below',
    }
  }

  useEffect(() => {
    if (textKey && !rendered) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      text = text || ""
      setItemKey(textKey)
      setTextValue(text)
      const bb = bbcodeParser.bbcodeToHtml(text)
      setRendered(bb)
      setTaRows(text.split(/\r\n|\r|\n/).length)
    }
  }, [textKey, text, rendered])

  function setKeyAndUpdate(newKey) {
    setItemKey(newKey)
    onUpdated({
      textKey: newKey,
    })
  }

  function setTextValueAndPrint(incomingValue) {
    setTextValue(incomingValue)
    const bb = bbcodeParser.bbcodeToHtml(incomingValue)
    setRendered(bb)
    setTaRows(incomingValue.split(/\r\n|\r|\n/).length)
    onUpdated({
      text: incomingValue
    })
  }

  return (
    <Container>
      <Form className="editor">
        <Form.Group widths='equal'>
          <Form.Input
            label='Localization Key'
            type='text'
            defaultValue={itemKey}
            onBlur={e => setKeyAndUpdate(e.target.value)}
            error={!itemKey ? emptyError("This field must have a value! If you want to remove it, click on the delete button") : false} />
          <Button color='red' onClick={() => onDeleted(itemKey)}>Remove</Button>
        </Form.Group>
        <Form.TextArea
          className="no-resize"
          rows={taRows}
          label={`Localized text`}
          defaultValue={textValue}
          onChange={e => setTextValueAndPrint(e.target.value)}
          error={!textValue ? emptyError() : false} />
        <Form.Field>
          <label>Result</label>
          <div className="result" dangerouslySetInnerHTML={{ __html: rendered }}></div>
        </Form.Field>
        <Divider />
      </Form>
    </Container>
  )
}

export default App;
