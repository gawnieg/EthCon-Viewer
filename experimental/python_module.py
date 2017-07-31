import os, sys, json, numpy as np
import pymongo
con = pymongo.MongoClient()
coll = con.trans.test #collection route
from graph_tool.all import *


#Read data from stdin
def read_in():
    store=[]
    lines = sys.stdin.readlines()
    #Since our input would only be having one line, parse our JSON data from that
    for line in lines:
        # print(line)
        store.append(json.loads(line))
    return store # was json.loads(lines[0])

def main():
    #get our data as an array from read_in()
    fromstdin = read_in()
    fileaddress=fromstdin[0];
    print("python: reading dot file: "+fileaddress)
    # print("python colorarray", fromstdin[1])

    colorarray = fromstdin[1]
    labelarray = fromstdin[2]
    namingarray =fromstdin[3]
    #then load file
    #then split in memory according to "}"
    #then save into seperate files
    #then generate graph image for each
    print("loading file")
    with open(fileaddress,"r") as tf:
        print("opened file")
        a = tf.read() # a is all the graphs formatting for the block

    x = a.split("}") # split on } (aka end of dot file)
    res=[]
    i=0


    for y in x[:-1]:
        #print("in loop!")
        y=y+"}" # put it back in!
        res.append(y)
        y=str(y)
        print("y is ",y)

        #filename = fileaddress #WAS THIS
        filename = namingarray[i]

        # filename = filename + str(i)
        # filename = filename + ".dot"
        print("saving to " +filename)
        with open(filename, "w") as text_file:
            text_file.write(y)

        #now check if the file is already there

        fcheckname = "./public/pics/"+filename+".png"
        print("checking to see if graph is already there at "+ fcheckname)
        isthere = os.path.isfile(fcheckname) # this will be True if there file is already there
        edge_des_color = [0.9,0.9,0.8,0.9]#this is edge colour
        if(isthere==False):
            # now generate graphs from each file on disk
            ii=0 # second index needed for colour and label array
            print("no graph found ....generating graph...")
            g=load_graph(filename,"dot")#this should be the dot file contents but now we will just pass the file address
            # section setting labels!
            v_prop=g.new_vertex_property("string") #for label
            v_prop2 = g.new_vertex_property("string") #for colour
            #assigning colours to each vertex in loop
            for vertex in g.vertices():
                v_prop[vertex]=labelarray[ii]
                v_prop2[vertex]=colorarray[ii]
                ii=ii+1
            folderout=fcheckname    #"./public/pics/"+filename+".png"
            #now actually draw graph and save to folderout
            # graph_draw(g, vertex_text= v_prop, vertex_font_size=8, edge_color=edge_des_color,output=folderout) #vertex_text=v_prop, to show labels on nodes
            graph_draw(g, vertex_fill_color=v_prop2, edge_color=edge_des_color,output=folderout) #vertex_text=v_prop, to show labels on nodes

            #new section to update mongo to say that the graph has been generated
            data =[{"randomHash":str(filename)}]
            print("attempting to update "+str(filename))
            toupdate=str(filename)
            for d in data:
                coll.update( {"randomHash": toupdate},{"$set": {"graphToolsGen": 1}})
                print("updated DB")

        i=i+1
        #now delete the file on dis
        print("deleting temp file "+filename)
        os.remove(filename)


    print("yurt- read the file,made the graph "+folderout)
    print("done")

#start process
if __name__ == '__main__':
    main()
