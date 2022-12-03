import { useState, useEffect } from 'react'
import {
  Dialog, DialogActions, DialogContent, DialogTitle,
  Table, TableHead, TableBody, TableRow, TableCell,
  Button, Typography, TextField
} from '@material-ui/core'
import dayjs from 'dayjs'
import { saveAs } from 'file-saver'
import { DeviceInfo, SensorInfo, NewSensorInfo } from 'furitype'

function SensorDialog(props: {
  open: boolean,
  deviceInfo: DeviceInfo,
  info?: SensorInfo,
  onSubmit(info: NewSensorInfo | SensorInfo): void,
  onDelete(info: SensorInfo): void,
  onClose(): void,
}) {
  const info = props.info

  const [newInfo, setNewInfo] = useState<NewSensorInfo | SensorInfo | null>(null)

  useEffect(() => {
    if (info) {
      setNewInfo({ ...info })
    } else {
      const info: NewSensorInfo = {
        deviceId: props.deviceInfo.id,
        name: '',
        value: '',
      }
      setNewInfo(info)
    }
  }, [props.deviceInfo, info])

  if (!newInfo) {
    return <></>
  }

  function handleSubmit() {
    if (!newInfo?.name) {
      alert('Name is empty')
    } else {
      props.onSubmit(newInfo)
    }
  }

  function handleDownloadValue() {
    if (newInfo) {
      const blob = new Blob([newInfo.value], { type: 'text/plain;charset=utf-8' })
      saveAs(blob, newInfo.name)
    }
  }

  return (
    <Dialog
      open={props.open}
      fullWidth
      maxWidth='xs'
      onClose={props.onClose}
    >
      <DialogTitle>
        {info ? `Sensor "${info.name}"` : 'New Sensor'} of Device "{props.deviceInfo.name}"
      </DialogTitle>
      <DialogContent>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell colSpan={2}>
                <Typography variant='h5'>
                  Sensor Information
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>
                <TextField
                  label='Name'
                  value={newInfo.name}
                  type='text'
                  onChange={e => {
                    setNewInfo({ ...newInfo, name: e.target.value })
                  }}
                />
              </TableCell>
            </TableRow>
            {info && (
              <TableRow>
                <TableCell>LastUpdated</TableCell>
                <TableCell>
                  {info.lastUpdated && (
                    <TextField
                      label='Last Update Date'
                      value={dayjs.unix(info.lastUpdated).format('YYYY-MM-DDTHH:mm:ss.SSS')}
                      type='datetime-local'
                      disabled
                    />
                  )}
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell>Value</TableCell>
              <TableCell>
                <TextField
                  label='Sensor Value'
                  value={newInfo.value.substring(0, 200)}
                  type='text'
                  multiline
                  disabled
                />
              </TableCell>
            </TableRow>
            {newInfo.value.length > 200 && (
              <TableRow>
                <TableCell colSpan={2}>
                  <Button variant='contained' color='primary' onClick={handleDownloadValue}>
                    Download Full Sensor Value
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        {info && (
          <Button color='primary' onClick={() => props.onDelete(info)}>
            Delete
          </Button>
        )}
        <Button color='primary' onClick={handleSubmit}>
          Submit
        </Button>
        <Button color='secondary' onClick={props.onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SensorDialog
