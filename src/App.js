import './App.css';
import React, { useEffect, useState } from 'react';
import bbcodeParser from "./BBCodeEmulator";
import { Form, Button } from 'semantic-ui-react'
import { Divider, Container } from 'semantic-ui-react'
import { DEFAULT } from "./items.default";
function App() {
  const [items, setItems] = useState(DEFAULT);

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
      setItems(obj)
    } catch (error) {
      alert("Hey, this file is not a valid localization file (a JSON file)")
    }
  }

  function addNewKeyVar() {
    const _internalJSON = { ...items }
    _internalJSON[`Random_string_${new Date().getMilliseconds()}`] = "Something goes here"
    setItems(_internalJSON)
  }

  function deleteKeyVal(keyVal) {
    const _internalJSON = { ...items }
    delete _internalJSON[keyVal]
    setItems(_internalJSON)
  }

  function updateInternalJson(payload) {
    if (payload.value !== undefined) {
      const _internalJSON = { ...items }
      _internalJSON[payload.keyVal] = payload.value
      setItems(_internalJSON)
    } else if (payload.keyVal) {

    }
  }

  function downloadJSON() {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
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
        {Object.keys(items).map((key, i) => (
          <Editor key={key} textKey={key} text={items[key]} onUpdated={updateInternalJson} onDeleted={() => deleteKeyVal()}></Editor>
        ))}
      </div>
    </div>
  );
}

function Editor({ textKey, text, onUpdated, onDeleted }) {
  const [keyVal, setkeyVal] = useState("");
  const [value, setValue] = useState("");
  const [rendered, setRendered] = useState("")
  const [taRows, setTaRows] = useState(5)
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
      setkeyVal(textKey)
      setValue(text)
      const bb = bbcodeParser.bbcodeToHtml(text)
      setRendered(bb)
      setTaRows(text.split(/\r\n|\r|\n/).length)
    }
  }, [textKey, text, rendered])

  function setKeyAndUpdate(val) {
    setkeyVal(val)
    onUpdated({
      keyVal: keyVal,
      value: val
    })
  }

  function setValueAndPrint(incomingValue) {
    setValue(incomingValue)
    const bb = bbcodeParser.bbcodeToHtml(incomingValue)
    setRendered(bb)
    setTaRows(incomingValue.split(/\r\n|\r|\n/).length)
    onUpdated({
      keyVal: keyVal,
      value: incomingValue
    })
  }

  return (
    <Container>
      <Form className="editor">
        <Form.Group widths='equal'>
          <Form.Input
            label='Locale Key'
            type='text'
            value={keyVal}
            onChange={e => setKeyAndUpdate(e.target.value)}
            error={!keyVal ? emptyError("This field must have a value! If you want to remove it, click on the delete button") : false} />
          <Button color='red' onClick={() => onDeleted(keyVal)}>Remove</Button>
        </Form.Group>
        <Form.TextArea
          className="no-resize"
          rows={taRows}
          label={`Locale Content for ${keyVal}`}
          value={value}
          onChange={e => setValueAndPrint(e.target.value)}
          error={!value ? emptyError() : false} />
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
