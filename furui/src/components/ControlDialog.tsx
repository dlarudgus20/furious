import { useState, useEffect } from 'react'
import {
  Dialog, DialogActions, DialogContent, DialogTitle,
  Table, TableHead, TableBody, TableRow, TableCell,
  Button, Typography, TextField
} from '@mui/material'
import { DeviceInfo, ControlInfo, NewControlInfo } from 'furitype'
import OnlineStatus from './OnlineStatus'

function ControlDialog(props: {
  open: boolean,
  deviceInfo: DeviceInfo,
  info?: ControlInfo,
  onSubmit(info: NewControlInfo | ControlInfo): void,
  onDelete(info: ControlInfo): void,
  onPress(info: ControlInfo): void,
  onClose(): void,
}) {
  const info = props.info

  const [newInfo, setNewInfo] = useState<NewControlInfo | ControlInfo | null>(null)

  useEffect(() => {
    if (info) {
      setNewInfo({ ...info })
    } else {
      const info: NewControlInfo = {
        deviceId: props.deviceInfo.id,
        name: '',
      }
      setNewInfo(info)
    }
  }, [props.deviceInfo.id, info])

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

  return (
    <Dialog
      open={props.open}
      fullWidth
      maxWidth='xs'
      onClose={props.onClose}
    >
      <DialogTitle>
        {info ? `Control "${info.name}"` : 'New Control'} of Device "{props.deviceInfo.name}"
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
                <TableCell>Pressed</TableCell>
                <TableCell>
                  <OnlineStatus
                    value={info.pressed}
                    positiveLabel='Device is processing this command'
                    negativeLabel='Device is not processing this command'
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        {info && (
          <>
            <Button
              variant='outlined'
              color='secondary'
              disabled={info.pressed}
              onClick={() => props.onPress(info)}
            >
              Press Command
            </Button>
            <Button color='primary' onClick={() => props.onDelete(info)}>
              Delete
            </Button>
          </>
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

export default ControlDialog
