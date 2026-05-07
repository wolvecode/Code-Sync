import ChatInput from "@/components/chats/ChatInput"
import ChatList from "@/components/chats/ChatList"
import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import useResponsive from "@/hooks/useResponsive"
import { SocketEvent } from "@/types/socket"
import { FormEvent, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "react-hot-toast"

const ChatsView = () => {
    const { viewHeight } = useResponsive()
    const { currentUser } = useAppContext()
    const { socket } = useSocket()
    const inputRef = useRef<HTMLTextAreaElement | null>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [text, setText] = useState("")

    const maxLen = useMemo(() => 300, [])
    const trimmed = text.trim()
    const isValid = trimmed.length > 0 && trimmed.length <= maxLen

    useEffect(() => {
        const handler = ({ message }: { message: string }) => {
            toast.error(message)
        }
        socket.on(SocketEvent.BROADCAST_ERROR, handler)
        return () => {
            socket.off(SocketEvent.BROADCAST_ERROR, handler)
        }
    }, [socket])

    const sendBroadcast = (e: FormEvent) => {
        e.preventDefault()
        if (!isValid) return
        socket.emit(SocketEvent.BROADCAST_MESSAGE, { text: trimmed })
        setText("")
        setIsOpen(false)
    }

    return (
        <div
            className="flex max-h-full min-h-[400px] w-full flex-col gap-2 p-4"
            style={{ height: viewHeight }}
        >
            <h1 className="view-title">Group Chat</h1>
            {currentUser.isAdmin ? (
                <div className="rounded-md border border-darkHover bg-dark p-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-primary">
                            Admin tools
                        </span>
                        <button
                            className="rounded-md bg-primary px-3 py-1 text-sm text-black"
                            onClick={() => {
                                setIsOpen((v) => !v)
                                setTimeout(() => inputRef.current?.focus(), 0)
                            }}
                            type="button"
                        >
                            {isOpen ? "Close" : "Broadcast"}
                        </button>
                    </div>

                    {isOpen ? (
                        <form onSubmit={sendBroadcast} className="mt-2 flex flex-col gap-2">
                            <textarea
                                ref={inputRef}
                                className="min-h-[72px] w-full resize-none rounded-md bg-darkHover p-2 outline-none"
                                placeholder="Write a broadcast message for everyone…"
                                value={text}
                                maxLength={maxLen}
                                onChange={(e) => setText(e.target.value)}
                            />
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-white/70">
                                    {trimmed.length}/{maxLen}
                                </span>
                                <button
                                    className="rounded-md bg-primary px-3 py-1 text-sm text-black disabled:opacity-50"
                                    type="submit"
                                    disabled={!isValid}
                                >
                                    Send
                                </button>
                            </div>
                        </form>
                    ) : null}
                </div>
            ) : null}
            {/* Chat list */}
            <ChatList />
            {/* Chat input */}
            <ChatInput />
        </div>
    )
}

export default ChatsView
