import './App.css';
import React, { useEffect, useState } from 'react';
import bbcodeParser from "./BBCodeEmulator";
import { Form, Button, Input } from 'semantic-ui-react'
import { Divider, Container } from 'semantic-ui-react'
import { DEFAULT } from "./items.default";
function App() {
  const [items, setItems] = useState(DEFAULT);

  function readJSON(e) {
    var reader = new FileReader();
    reader.onload = onReaderLoad;
    if (e.target.files[0]) {
      reader.readAsText(e.target.files[0]);
    }
  }

  function onReaderLoad(event) {
    console.log(event.target.result);
    var obj = JSON.parse(event.target.result);
    setItems(obj)
  }

  function deleteKeyVal(keyVal) {
    const _internalJSON = items
    delete _internalJSON[keyVal]
    setItems(_internalJSON)
  }

  function updateInternalJson(payload) {
    if (!payload.keyVal || !payload.value) return
    console.log(payload)
    const _internalJSON = items
    _internalJSON[payload.keyVal] = payload.value
    setItems(_internalJSON)
  }

  function downloadJSON() {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items));
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
        <Container className="toolbar">
          <Button>New Project</Button>
          <Input label="Load file" onChange={readJSON} id="file" type="file" />
          <Button onClick={downloadJSON}>Save to file</Button>
          <Divider></Divider>
        </Container>
      </header>

      <Container>
        <Button>Add new Line</Button>
      </Container>
      <div className="lists">
        {Object.keys(items).map((key, i) => (
          <Editor key={key} textKey={key} text={items[key]} onUpdated={updateInternalJson} onDeleted={deleteKeyVal}></Editor>
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

  onUpdated({
    keyVal: keyVal,
    value: value
  })

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

  function setValueAndPrint(val) {
    setValue(val)
    const bb = bbcodeParser.bbcodeToHtml(val)
    setRendered(bb)
    setTaRows(val.split(/\r\n|\r|\n/).length)
  }

  return (
    <Container>
      <Form className="editor">
        <Form.Group widths='equal'>
          <Form.Input label='Locale Key' type='text' value={keyVal} onChange={e => setkeyVal(e.target.value)} />
          <Button color='red' onClick={onDeleted(keyVal)}>Remove</Button>
        </Form.Group>
        <Form.TextArea
          className="no-resize"
          rows={taRows}
          label={`Locale Content for ${keyVal}`}
          value={value}
          onChange={e => setValueAndPrint(e.target.value)}
          error={!value ? {
            content: 'Hey, this is empty',
            pointing: 'below',
          } : false} />
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
